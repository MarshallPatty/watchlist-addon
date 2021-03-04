let watchlists
let textArea = document.querySelector('textarea')

function save(){
    browser.storage.local.set({
        watchlists: JSON.parse(textArea.value)
    })
}
  
function load() {
    browser.storage.local.get('watchlists').then(response => {
        watchlists = response.watchlists
        textArea.value = JSON.stringify(watchlists)
    })
}

document.addEventListener('DOMContentLoaded', load)
document.getElementById("save").addEventListener('click', save)
document.getElementById("add-watchlist").addEventListener('submit', addWatchlist)
document.getElementById("remove-watchlist").addEventListener('submit', remove)

document.getElementById("tmp").addEventListener('click', ()=>{
    browser.storage.local.set({
        watchlists: {"a": ["a", "b"], "b":["c", "D"]}
    })
})