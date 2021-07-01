
import { createConnection, Connection } from 'typeorm'
import { Photo } from './entity/Photo'

let connection: Connection

async function init() {
    connection = await createConnection({
        type: "postgres",
        host: "39.102.70.68",
        port: 5432,
        username: "postgres",
        password: "postgres",
        database: "postgres",
        entities: [Photo],
        synchronize: true,
        logging: false,
    })
    return connection
}

export default async function handler() {

    if (!connection || (connection && !connection.connect)) {
        connection = await init()
    }

    let photo = new Photo();
    photo.name = "Me and Bears";
    photo.description = "I am near polar bears";
    photo.filename = "photo-with-bears.jpg";
    photo.views = 1;
    photo.isPublished = true;

    let photoRepository = connection.getRepository(Photo);

    await photoRepository.save(photo);
    console.log("Photo has been saved");

    let savedPhotos = await photoRepository.find();
    console.log("All photos from the db: ", savedPhotos);

    return savedPhotos
}
