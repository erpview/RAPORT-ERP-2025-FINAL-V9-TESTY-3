exports.handler = async (event, context) => {
  const userAgent = event.headers['user-agent'] || '';
  const isBot = /bot|crawler|spider|googlebot/i.test(userAgent);
  
  if (isBot) {
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': '_role=crawler; Path=/',
      },
      body: JSON.stringify({ role: 'crawler' }),
    };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ role: 'user' }),
  };
};
