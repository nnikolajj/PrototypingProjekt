import db from "#lib/db.js"


export async function load(){
    return {
        url: await db.getWorkingIframeSrc("mad-max-fury-road")
    }
}