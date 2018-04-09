import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

//we are going to store our old item here since dynamodb puItem function overwrites
//the entire record
let oldAttachment = "";

export async function main(event, context, callback) {

  const data = JSON.parse(event.body);

//first we get the item that we are going to update
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

  try {
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
  } catch (e) {
  callback(null, failure({ status: false }));
  }

  //now we update
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


}
