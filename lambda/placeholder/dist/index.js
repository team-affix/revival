/**
 * Hello World AWS Lambda Function
 * 
 * A simple Lambda function that returns a greeting message
 */

exports.handler = async (event, context) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  // Prepare response
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello, World2!',
      timestamp: new Date().toISOString(),
      event: event
    })
  };
  
  return response;
};
