export const sendLog = async (endpoint, obj) => {
    try {
        return await fetch(`https://log.socialsuperpowers.net/api/${endpoint}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
        })
    } catch (error) {
        console.error(error);
    }
}