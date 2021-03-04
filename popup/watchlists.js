//load the watchlist
let watchlists
let popupContent = document.getElementById('popup-content')

//https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?&modules=summaryProfile,financialData

let data = {}
function getPrice() {
    for(watchlist of Object.keys(watchlists)) for(ticker of watchlists[watchlist]) data[ticker] = {}

    /*
    assetProfile
    financialData
    defaultKeyStatistics
    calendarEvents
    incomeStatementHistory
    cashflowStatementHistory
    balanceSheetHistory
    */

    //generate promises
    promises = []
    for(ticker of Object.keys(data)) promises.push(fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?&modules=financialData`))
    Promise.all(promises)
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(json => {
        for(i in json){
            price = json[i].quoteSummary.result[0].financialData.currentPrice.fmt
            data[Object.keys(data)[i]].price = price
            console.log(price)
            
        }

        getChange()
    })
}

function getChange(){
    var d = new Date()
    const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0)
    let fiveDaysAgo = new Date(utc)
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    const utc_fiveDaysAgo = Date.UTC(fiveDaysAgo.getUTCFullYear(), fiveDaysAgo.getUTCMonth(), fiveDaysAgo.getUTCDate(), 0, 0, 0)
    const period1 = utc_fiveDaysAgo / 1000
    const period2 = utc / 1000

    var promises = []
    for(ticker of Object.keys(data)) promises.push(fetch(`https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`))

    Promise.all(promises)
    .then(responses => Promise.all(responses.map(res => res.text())))
    .then(csv => {
        for(i in csv){
            //Date,Open,High,Low,Close,Adj Close,Volume
            console.log(csv[i])
            var lines = csv[i].split('\n')
            var open = lines[1].split(',')[1]
            var close = lines[lines.length - 1].split(',')[4]
            console.log(open, close)
            data[Object.keys(data)[i]].change5D = Math.round((close - open) / open * 100 * 100) / 100
            open = lines[lines.length - 1].split(',')[1]
            close = lines[lines.length - 1].split(',')[4]
            console.log(open, close)
            data[Object.keys(data)[i]].change1D = Math.round((close - open) / open * 100 * 100) / 100
        }

        createTables()
    })
}

function createTables(){
    popupContent.innerHTML = ``
    for(watchlist of Object.keys(watchlists)){
        let div = document.createElement('div')

        let table = document.createElement('table')
        let tableHTML = `
        <thead>
            <caption>${watchlist}</caption>
            <tr>
                <th>Ticker</th>
                <th>Price</th>
                <th>Change 1D</th>
                <th>Change 5D</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        `
        for(ticker of watchlists[watchlist]){
            tableHTML += `
            <tr>
                <td><a href="https://finance.yahoo.com/quote/${ticker}">${ticker}</a></td>
                <td>$${data[ticker].price}</td>
                <td class="${data[ticker].change1D > 0 ? 'green' : 'red'}">${data[ticker].change1D}%</td>
                <td class="${data[ticker].change5D > 0 ? 'green' : 'red'}">${data[ticker].change5D}%</td>
                <td><a href="https://finance.yahoo.com/chart/${ticker}">📈</a></td>
            </tr>
            `
        }
        tableHTML += `</tbody><br>`
        
        table.innerHTML = tableHTML
        div.appendChild(table)
        popupContent.appendChild(div)
    }
}

function load() {
    browser.storage.local.get('watchlists').then(response => {
        watchlists = response.watchlists
        getPrice()
    })
}

document.addEventListener('DOMContentLoaded', load)