import StatisticsSvelte from "../UI/Statistics/StatisticsGui.svelte"

const target = document.getElementById("main")
target.innerHTML = ""
new StatisticsSvelte({ target })
