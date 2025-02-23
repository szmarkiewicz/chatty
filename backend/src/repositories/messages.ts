import {Schema, Repository} from 'redis-om';
import {redisQueryClient} from "../redis";

const messageSchema = new Schema('message', {
    senderKey: {type: 'string'},
    text: {type: 'text'},
    mediaKeys: {type: 'string[]'},
    updatedAt: {type: 'number', sortable: true},
});

export const messageRepository = new Repository(messageSchema, redisQueryClient);