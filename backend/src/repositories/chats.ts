import {Schema, Repository} from 'redis-om';
import {redisQueryClient} from "../redis";

const chatSchema = new Schema('chat', {
    title: {type: 'string'},
    participantsKeys: {type: 'string[]'},
    authorKey: {type: 'string'},
    createdAt: {type: 'number', sortable: true},
    updatedAt: {type: 'number', sortable: true},
});

export const chatRepository = new Repository(chatSchema, redisQueryClient);