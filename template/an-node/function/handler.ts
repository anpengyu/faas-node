'use strict'

import "reflect-metadata";
import { createConnection, Connection } from "typeorm"
import { Photo3 } from "./entity/Photo";

let connection: Connection;

async function init() {
  connection = await createConnection({
    type: "postgres",
    host: "39.102.70.68",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    entities: [Photo3],
    synchronize: true,
    logging: false,
  });
  return connection;
}

export default async function handler(event: { body: any; headers: { [x: string]: any } }, context: { status: (arg0: number) => { (): any; new(): any; succeed: { (arg0: { body: any; 'content-type': any }): any; new(): any } } }) {

  if (!connection || (connection && !connection.connect())) {
    console.log('connection不存在或者connection 存在 并且没有连接')
    connection = await init()
  }

  console.log('..................')
  console.log(connection)

  let photo = new Photo3();
  photo.name = "Me and Bears";
  photo.description = "I am near polar bears";
  photo.filename = "photo-with-bears.jpg";
  photo.views = 1;
  photo.isPublished = true;

  let photoRepository = connection.getRepository(Photo3);

  await photoRepository.save(photo)
  let savedPhotos = await photoRepository.find();

  const result = {
    'body':savedPhotos,
    'content-type': event.headers["content-type"]
  }

  return context
    .status(200)
    .succeed(result)
}
