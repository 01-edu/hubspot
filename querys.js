// function that return a mailing list of the students that have unfinished toad games.
function unfishinedToadMail ()
{
    let unfinishedToad = `{
        games: toad_sessions(
        where: {
            _and: [
            { started_at: { _is_null: false } },
            { final_score: { _is_null: true } },
            ]
        }
        ) {
        updatedAt: updated_at
        candidate {
            login
        }
        }
    }`;
    return unfinishedToad;
}
function secondChanceMail ()
{
    let secondChance = `{
        user(
        where: {
               _and: [
                    { progresses: { path: { _eq: "/rouen/onboarding/games" }, grade: { _eq: 0 } } }
                    { _not: { progresses: { path: { _eq: "/rouen/onboarding/games" }, grade: { _neq: 0 } } } }
                    { _not: { progresses: { path: { _eq: "/rouen/onboarding/games" }, grade: { _is_null: true } } } }
                ]
       }
       ) {
       login
                progress: progresses_aggregate(where: { path: { _eq: "/rouen/onboarding/games"} }) {
                games: aggregate { count }
       }
       }
   }`;
   return secondChance;
}
module.exports = { unfishinedToadMail, secondChanceMail };
