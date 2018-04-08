import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

let oldAttachment = "";

export async function main(event, context, callback) {

  const data = JSON.parse(event.body);


//params for our get function
  const params2 = {
    TableName: "todos",
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      todoId: event.pathParameters.id
    }
  };

  //first lets get the old item that we are going to update

  const result = await dynamoDbLib.call("get", params2);
  if (result.Item) {
    // Return the retrieved item
    //save the attachment and use it just in case our user does not provide us with a new one
    oldAttachment = result.Item.attachment;
    console.log(oldAttachment);
    callback(null, success(result.Item));
  } else {
    callback(null, failure({ status: false, error: "Item not found." }));
  }

  const params = {
    TableName: "todos",
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      todoId: event.pathParameters.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET content = :content, attachment = :attachment",
    ExpressionAttributeValues: {
      ":attachment": data.attachment ? data.attachment : oldAttachment,
      ":content": data.content ? data.content : null
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    callback(null, success({ status: true }));
  } catch (e) {
    callback(null, failure({ status: false }));
  }

  // const result2 = await dynamoDbLib.call("get", params2);
  // if (result2.Item) {
  //   // Return the retrieved item
  //   //save the attachment and use it just in case our user does not provide us with a new one
  //   attachment = result2.Item.attachment;
  //   console.log(attachment);
  //   callback(null, success(result2.Item));
  // } else {
  //   callback(null, failure({ status: false, error: "Item not found." }));
  // }
}
