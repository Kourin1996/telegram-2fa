const TELEGRAM_TOKEN = '<TELEGRAM BOT TOKEN HERE>';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEB_PAGE_URL = '<WEB PAGE URL HERE>';

const wrapWithHeader = (body) => {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    },
    body: body
  } 
}

export const main = async (params) => {
    const {method, path, query, body} = params;

    if (path === '/webhook/tg/message') {
      return wrapWithHeader({ok: true, status: 200});
    }

    if (path === '/send_tx') {
      const {userOp, chatId} = body;
      if (!userOp || !chatId) {
        return wrapWithHeader({type: 'send_tx', status: false, reason: 'missing params'});
      }

      const opQuery = btoa(JSON.stringify(userOp))
      const signPageUrl = `${WEB_PAGE_URL}?page=sign&op=${opQuery}`

      const text1 = `Please sign this operation`
      const res1 = await fetch(`${TELEGRAM_API_URL}/sendMessage?chat_id=${chatId}&text=${text1}`, {
        method: 'GET',
      });
      const response1 = await res1.json();
      if (!response1.ok) {
        return wrapWithHeader({type: 'send_tx', status: false, reason: 'failed to send message 1', response});
      }

      const res2 = await fetch(`${TELEGRAM_API_URL}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(signPageUrl)}`, {
        method: 'GET',
      });
      const response2 = await res2.json();
      if (!response2.ok) {
        return wrapWithHeader({type: 'send_tx', status: false, reason: 'failed to send message 2', response});
      }
      
      return wrapWithHeader({type: 'send_tx', status: true, response});
    }

    return wrapWithHeader({status: true})
} 