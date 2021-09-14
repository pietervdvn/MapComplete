const client_token = "MLY|4441509239301885|b40ad2d3ea105435bd40c7e76993ae85"

const image_id = '196804715753265';
const api_url = 'https://graph.mapillary.com/' + image_id + '?fields=thumb_1024_url&&access_token=' + client_token;
fetch(api_url,
    {
        headers: {'Authorization': 'OAuth ' + client_token}
    }
).then(response => {
    return response.json()
}).then(
    json => {
        const thumbnail_url = json["thumb_1024"]
        console.log(thumbnail_url)
    }
)