function process() {
    console.clear();

    const knowledge_ranks = {1: '', 2: '', 3: ''};
    const skills_ranks = {1: '', 2: '', 3: ''};
    const abilities_ranks = {1: '', 2: '', 3: ''};
    
    const slots = document.querySelectorAll('[socialvr-barge-slot=""]');

    slots.forEach((slot) => {

    });
    
    const data = {
        completed: Date.now(),
        knowledge: knowledge_ranks,
        skills: skills_ranks,
        abilties: abilities_ranks
    };

    console.log(JSON.stringify(data));
}

export { process };