import { createClient } from '@01-edu/api';
import { readFile, readdir } from 'fs/promises'
import sqlite3 from 'better-sqlite3'
import readmail from './readmails.js';
import querys from './querys.js';
import nodemailer from 'nodemailer';

async function localDB()
{
  // init db and log verbose for debug
  console.log('loading sqlite database')
  const db = sqlite3('data.db', {
    //verbose: console.log
  })

  // set performances parameters
  db.pragma('synchronous=NORMAL')
  db.pragma('journal_mode=WAL')

  // current db version
  const { user_version } = db.prepare('pragma user_version').get()

  // load sql files
  for (const migrationName of await readdir('.')) {
    if (!migrationName.endsWith('.sql')) continue
    const migrationVersion = Number(migrationName.split('_')[0])
    if (migrationVersion > user_version) {
      console.log('applying migration', migrationName)
      db.exec(await readFile(migrationName, { encoding: 'utf8' }))
      db.pragma(`user_version=${migrationVersion}`)
    }
  }


  console.log('all migrations applied !')

  const selectUser = db.prepare(`
  SELECT
    createdAt,
    login,
    email,
    step,
    notifyStep,
    notifyAt
  FROM user
  WHERE login = ?
  `)
  const selectMail = db.prepare(`
  SELECT
    email
  FROM user
  WHERE login = ?
  `)

  const selectLastCreatedAt = db.prepare(`
  SELECT
    createdAt
  FROM user
  ORDER BY createdAt DESC
  LIMIT 1
  `)

  const insertUser = db.prepare(`
  INSERT INTO user
    (createdAt, login, email)
  VALUES
    (?, ?, ?)
  `)

  // a default timestamp to 0 will be Jan 01 1970
  // safe to assume no users should be created before that :)
  const lastCreatedAt = selectLastCreatedAt.get()?.createdAt || 0

return db;
}

async function loadDB()
{
  let db = await localDB();
  const selectLastCreatedAt = db.prepare(`
  SELECT
  createdAt
  FROM user
  ORDER BY createdAt DESC
  LIMIT 1
  `)

  const lastCreatedAt = selectLastCreatedAt.get()?.createdAt || 0
  //connexion to Zone01normandie DataBase
  console.log('connect to zone01normandie.org')
  const { run } = await createClient({
    domain: 'zone01normandie.org',
    access_token: '***',
  })

  console.log('loading new users')
  const { newUsers } = await run(
    `query($latest: timestamptz!) {
    newUsers: user(
      where: { createdAt: { _gt: $latest } }
    ) { createdAt login attrs }
  }`,
    { latest: new Date(lastCreatedAt) },
  )

  let newUserCount = 0
  for (const { createdAt, login, attrs } of newUsers) {
    try {
      insertUser.run(new Date(createdAt).getTime(), login, attrs.email)
      newUserCount++
    } catch (err) {
      // it is possible that some user are already registered
      // due to limited precision in JS dates vs postgres
      console.log(err.message, { login })
    }
  }

  console.log(newUserCount, 'new user loaded')
return run;
}
//-----------------------------END DB setup------------------------------------//

async function send(mailName, mailSubject)
{
  
  let mailingList = new Array;
  let mailbody = readmail.readMail(mailName);
  mailingList = await getMail(mailName);
  mailingList.push("baptiste.pholoppe@zone01normandie.org")
  //sendMail(mailbody,mailSubject,mailingList) // to send mails.
  console.log(mailingList);
  console.log(mailingList.length + " Email sent for " + mailName + " !") 
}
async function getMail (mailname)
{
  let dbRun = await loadDB();
  let db = await localDB();
  let list = new Array;
  if (mailname == "mailrelance.txt")
  {
    let z01Relance = await run(querys.unfishinedToadMail());
    z01Relance["games"].forEach(element => {
      list.push(db.prepare("SELECT email FROM user WHERE login = '"+element["candidate"].login+"'").get().email);           
    });
    
  }
  else if (mailname == "mailsecondechance.txt")
  {
    let z01Chance = await run(querys.secondChanceMail());
    z01Chance["user"].forEach(element => {
      list.push(db.prepare("SELECT email FROM user WHERE login = '"+element.login+"'").get().email);
    });
  }
  else if (mailname == "passedtoad.txt")
  {
    let z01passedToad = await dbRun(querys.passedToadsMail());
    z01passedToad["user"].forEach(element => {
      list.push(db.prepare("SELECT email FROM user WHERE login = '"+element.login+"'").get().email);
    })

  }
  return list;
}

async function sendMail(mailText, mailSubject, studentMail) {

  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    tls: {
      ciphers:'SSLv3'
    },
   // service : 'Gmail',
    auth: {
      user: "***",
      pass: "***", 
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Zone01 Rouen" <noreply@zone01normandie.org>', // sender address
    bcc: studentMail, // list of receivers
    subject: mailSubject, // Subject line
    text: " ", // plain text body
    html: mailText // html body
  });

  console.log("Message sent: %s", info.messageId);
  return 1;
}

send("passedtoad.txt", "Le numérique va changer ta vie : une 2ème opportunité s'offre à toi!");
