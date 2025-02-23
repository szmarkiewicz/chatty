import {redisQueryClient} from "../redis.js";
import {saveNewUser} from "../controllers/auth.js";
import {addMessageToSortedSet, createChat} from "../controllers/chats.js";
import EntityId from "./entityId.js";
import {getChecksum} from "../controllers/media.js";
import fs from "node:fs";
import mime from "mime-types";
import path from "node:path";
import {mediaRepository} from "../repositories/media.js";
import {chatRepository} from "../repositories/chats.js";
import {messageRepository} from "../repositories/messages.js";

const timestamp = 1736127936; // 6th of Jan

const TWO_DAYS = 1000 * 60 * 60 * 24 * 2;
const ONE_HOUR = 1000 * 60 * 60;

const users = [
    {username: 'mike123', password: 'HardPassword123'},
    {username: 'josh', password: 'HardPassword123'},
    {username: 'simon', password: 'HardPassword123'},
    {username: 'anonymous', password: 'HardPassword123'},
    {username: 'kevinisthebest', password: 'HardPassword123'},
    {username: 'jess2001', password: 'HardPassword123'},
    {username: 'criticalthinker', password: 'HardPassword123'},
    {username: 'veteran', password: 'HardPassword123'},
];

const chats: {
    username: string,
    topic: string,
    title: string,
    text: string,
    mediaKeys: string[],
    otherParticipants: string[],
    messages: { username: string, text: string, mediaKeys: string[], createdAtOffset: number }[],
    timestamp: number
}[] = [
    {
        username: 'simon',
        topic: 'smartphones',
        title: 'Are Smartphones Making Us Less Social?',
        text: 'In a world where everyone seems glued to their screens, are we becoming less social in real life? Smartphones help us stay connected virtually, but is it at the cost of face-to-face interactions? Share your thoughts on how smartphones have changed your social habits—positively or negatively.',
        mediaKeys: [],
        otherParticipants: ['jess2001', 'josh', 'criticalthinker'],
        messages: [
            {
                username: 'jess2001',
                text: 'I think smartphones are definitely making us less social in real life. I’ve noticed that even during family gatherings, everyone is on their phones instead of talking to each other. It feels like people prefer online conversations over face-to-face interactions. We need to start putting our phones down and living in the moment.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'criticalthinker',
                text: 'I disagree! Smartphones actually help me stay more connected with friends and family, especially those who live far away. I’ve rekindled old friendships through social media, and group chats make it easy to stay in touch. It’s all about balance. If you’re mindful of your usage, smartphones don’t have to make you less social.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'josh',
                text: 'Personally, I’ve experienced both sides of this. When I’m out with friends, I make a conscious effort to stay off my phone. But it’s hard when others don’t do the same. There’s nothing worse than being at a dinner table where everyone is scrolling through their phones instead of talking. It’s a habit we all need to break.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            }
        ],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'jess2001',
        topic: 'education',
        title: 'Should Education Be Free for Everyone?',
        text: 'Many argue that education is a basic human right and should be free at all levels, while others believe it’s an individual responsibility. What are the potential benefits and drawbacks of free education? Would it improve society, or would it put too much strain on economies?',
        mediaKeys: [],
        otherParticipants: ['josh', 'criticalthinker', 'simon'],
        messages: [
            {
                username: 'simon',
                text: 'Yes, education should be free for everyone! Knowledge is a basic human right, and access to education can break the cycle of poverty. Many talented people are held back because they can\'t afford tuition. If we want a more equal society, education must be accessible to all.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
        ],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'anonymous',
        topic: 'ai',
        title: 'Can Artificial Intelligence Replace Human Creativity?',
        text: 'AI is rapidly evolving, even creating art, music, and literature. But can AI ever truly replicate human creativity, or is creativity an inherently human trait? Let’s discuss whether AI can complement creative processes or if it risks diluting the authenticity of human expression.',
        mediaKeys: [],
        otherParticipants: ['jess2001', 'josh', 'criticalthinker'],
        messages: [],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'criticalthinker',
        topic: 'workweeks',
        title: 'Should Workweeks Be Reduced to Four Days?',
        text: 'Many companies are experimenting with a four-day workweek, claiming it boosts productivity and improves work-life balance. Would this model work universally, or does it depend on the industry? How would a shorter week affect your own productivity and mental health? Share your perspective.',
        mediaKeys: [],
        otherParticipants: ['jess2001', 'josh', 'simon', 'kevinisthebest', 'anonymous', 'mike123', 'veteran'],
        messages: [
            {
                username: 'veteran',
                text: 'Absolutely! A four-day workweek would boost productivity and improve mental health. People would have more time to rest, spend with family, and pursue personal interests, leading to happier and more motivated employees. Companies that have tried it are already seeing the benefits—why not make it the norm?',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'josh',
                text: 'I’m not sure it would work for every industry. Some jobs require constant availability, like healthcare or customer service. A four-day workweek might work for office jobs, but for others, it could create staffing issues and hurt businesses. We need a more flexible approach rather than a one-size-fits-all solution.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'mike123',
                text: 'I think it’s a great idea! I’ve noticed that I’m more productive at the beginning of the week, and by Friday, I’m just exhausted. If we had a longer weekend, people could recharge and return to work refreshed. It would also reduce burnout, which is a huge problem right now.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            }
        ],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'veteran',
        topic: 'social-media',
        title: 'Should Social Media Platforms Regulate Content More Strictly?',
        text: 'Misinformation, hate speech, and harmful content spread easily on social media. Should platforms like Facebook and Twitter be responsible for stricter regulation, or does that infringe on free speech? How can we balance safety with freedom of expression in the digital age?',
        mediaKeys: [],
        otherParticipants: [],
        messages: [],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'criticalthinker',
        topic: 'voting',
        title: 'Should Voting Be Mandatory?',
        text: 'In some countries, voting is mandatory, while in others, it’s a choice. Would mandatory voting strengthen democracy by increasing participation, or would it lead to uninformed voting? How do we balance individual freedom with civic responsibility in a democracy?',
        otherParticipants: ['jess2001'],
        mediaKeys: [],
        messages: [],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'mike123',
        topic: 'social-media-relationships',
        title: 'Social Media Is Destroying Genuine Relationships',
        text: 'Social media creates the illusion of connection but damages real relationships. People prioritize online validation over meaningful interactions. It’s making us more anxious, lonely, and disconnected. Are platforms like Instagram and TikTok really worth the mental toll they take on users? Let’s discuss.',
        mediaKeys: [],
        otherParticipants: ['jess2001', 'josh', 'criticalthinker'],
        messages: [],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'kevinisthebest',
        topic: 'hard-work',
        title: 'Working Hard Isn’t Enough to Succeed Anymore',
        text: 'The idea that success comes purely from hard work is outdated. In today’s world, connections, privilege, and luck often play a bigger role than effort. While hard work is important, it’s not always enough. Do you agree that the "work hard, succeed" mantra is unrealistic in modern society?',
        mediaKeys: [],
        otherParticipants: [],
        messages: [],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'josh',
        topic: 'billionaires',
        title: 'The World Needs Fewer Billionaires, Not More',
        text: 'Billionaires hoard wealth while millions struggle to survive. No one earns billions ethically—it’s always at the cost of someone else. Instead of celebrating billionaires, we should be questioning the system that allows such extreme inequality. Should there be a limit on how much wealth one person can have?',
        mediaKeys: [],
        messages: [],
        otherParticipants: ['jess2001', 'veteran'],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'josh',
        topic: 'climate-change',
        title: 'Climate Change Is a Human Failure, Not a Natural Disaster',
        text: 'Climate change isn’t just a natural phenomenon—it’s a direct result of human greed, exploitation, and ignorance. Governments and corporations prioritize profits over the planet, and we’re paying the price. Do you agree that humanity has caused this crisis, and are we doing enough to fix it?',
        mediaKeys: [],
        otherParticipants: ['jess2001', 'criticalthinker', 'simon', 'kevinisthebest', 'anonymous', 'mike123', 'veteran'],
        messages: [
            {
                username: 'josh',
                text: 'Completely agree. Climate change is a result of human greed and neglect. We’ve ignored the warning signs for decades, and now we’re paying the price. Governments and corporations need to be held accountable.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'simon',
                text: 'I partly agree, but nature also has cycles of change. That said, humans have accelerated the process dramatically with deforestation, pollution, and overconsumption. It’s a crisis we created, and we must take responsibility.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'anonymous',
                text: 'Yes, it’s a human failure. The science has been clear for years, but people still deny it. If we had acted sooner, we wouldn’t be in this mess. The lack of urgency from leaders is shocking.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'jess2001',
                text: 'Blaming nature is just an excuse. We’ve destroyed ecosystems and burned fossil fuels without considering the consequences. It’s time for drastic changes in our lifestyles and policies to reverse the damage we’ve caused.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'mike123',
                text: 'I think it’s unfair to blame individuals when large corporations are the biggest polluters. The real failure is letting profit-driven companies pollute without limits. If we don’t hold them accountable, nothing will change.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
        ],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'mike123',
        topic: 'quitting-job',
        title: 'Quitting a High-Paying Job Was the Best Decision I Ever Made',
        text: 'A few years ago, I left a high-paying corporate job that drained me mentally and emotionally. Everyone told me I was crazy to walk away from the "dream career," but I knew my well-being mattered more than the paycheck. Since then, I’ve found a job that aligns with my values and allows me to enjoy life again. Have you ever made a similar leap? Let’s discuss whether chasing money is truly worth it if it costs your peace of mind.',
        mediaKeys: [],
        otherParticipants: ['criticalthinker', 'kevinisthebest', 'anonymous'],
        messages: [],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
    {
        username: 'jess2001',
        topic: 'solo-travel',
        title: 'Traveling Alone Is the Most Empowering Experience You Can Have',
        text: 'Last year, I took my first solo trip, and it changed my life. I was nervous at first, but being completely responsible for my own experience was liberating. I learned more about myself in two weeks than I had in years. Meeting new people, navigating unfamiliar places, and facing challenges alone made me more confident and self-reliant. Have you ever traveled alone? If not, would you consider it? Let’s talk about how solo travel can impact personal growth.',
        otherParticipants: ['criticalthinker', 'simon', 'kevinisthebest', 'anonymous', 'mike123', 'veteran', 'josh'],
        mediaKeys: [],
        messages: [
            {
                username: 'mike123',
                text: 'Totally agree! Traveling alone taught me independence and confidence.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'jess2001',
                text: 'I’m nervous to try solo travel, but I’ve heard it’s life-changing!',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'anonymous',
                text: 'I’ve done it, and it’s true—solo travel forces you to grow.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'josh',
                text: 'You learn so much about yourself when you travel alone.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'anonymous',
                text: 'I disagree. Traveling with others creates shared memories that last forever.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'mike123',
                text: 'Solo travel is empowering, but it can be lonely at times too.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'criticalthinker',
                text: 'The best part of traveling alone? You set your own schedule!',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'veteran',
                text: 'I met amazing people during my solo trips—so rewarding!',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'anonymous',
                text: 'It’s empowering, but safety concerns make me hesitate.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'jess2001',
                text: 'Traveling alone helped me overcome my fear of the unknown.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'criticalthinker',
                text: 'I prefer traveling with friends, but I’d try a solo trip someday.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'veteran',
                text: 'Solo trips push you out of your comfort zone in the best way.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'veteran',
                text: 'I traveled alone once—it made me more self-reliant.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'jess2001',
                text: 'I think it depends on your personality. Some people prefer company.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'josh',
                text: 'I love the freedom of solo travel! No compromises.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'kevinisthebest',
                text: 'Solo travel isn’t for everyone, but it was life-changing for me.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'josh',
                text: 'You discover so much about the world—and yourself—when you go alone.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'kevinisthebest',
                text: 'It sounds empowering, but isn’t it also risky?',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'kevinisthebest',
                text: 'I’ve done it, and I’ll never go back to group trips!',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'veteran',
                text: 'Traveling alone is intimidating at first, but so worth it.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'veteran',
                text: 'Solo travel taught me problem-solving skills I never knew I had.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'veteran',
                text: 'I’ve always wanted to try solo travel but haven’t had the courage yet.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'anonymous',
                text: 'You really learn to enjoy your own company when traveling alone.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'anonymous',
                text: 'It’s true! Solo travel makes you more adaptable and resourceful.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            },
            {
                username: 'josh',
                text: 'Honestly, solo travel made me realize how capable I truly am.',
                mediaKeys: [],
                createdAtOffset: Math.round(Math.random() * ONE_HOUR)
            }
        ],
        timestamp: timestamp + Math.round(Math.random() * TWO_DAYS),
    },
]

// https://gist.github.com/lovasoa/8691344
async function* iterateThroughDirectory(directoryPath: string) {
    for await (const entry of await fs.promises.opendir(directoryPath)) {
        const entryPath = path.join(directoryPath, entry.name);
        if (entry.isDirectory()) yield* iterateThroughDirectory(entryPath);
        else if (entry.isFile()) yield entryPath;
    }
}

export default async function initializeDemoData() {
    if (await redisQueryClient.get('db-initialized') === 'true') {
        console.log("DB already initialized with data. Nothing added");
        return;
    }

    console.log("Starting DB initialization with data...");

    try {
        // Add files to db, link ids to chats and messages
        for await (const filePath of iterateThroughDirectory('src/assets/chats')) {
            const fileBuffer = fs.readFileSync(filePath);
            const fileChecksum = await getChecksum(fileBuffer);
            const fileMimeType = mime.lookup(filePath);
            const pathElements = filePath.split('/');

            const filename = pathElements.pop();
            const topic = pathElements.pop();
            const chat = chats.find(chat => chat.topic === topic)!;

            const mediaFile = await mediaRepository.save({
                checksum: fileChecksum,
                filename,
                contentType: fileMimeType,
                data: fileBuffer.toString('base64'),
                createdAt: chat.timestamp,
            });

            chat.mediaKeys.push(mediaFile[EntityId]);
        }
        for await (const filePath of iterateThroughDirectory('src/assets/messages')) {
            const fileBuffer = fs.readFileSync(filePath);
            const fileChecksum = await getChecksum(fileBuffer);
            const fileMimeType = mime.lookup(filePath);
            const pathElements = filePath.split('/');

            const filename = pathElements.pop();
            const messageIndex = parseInt(pathElements.pop());
            const topic = pathElements.pop();
            const chat = chats.find(chat => chat.topic === topic)!;

            const mediaFile = await mediaRepository.save({
                checksum: fileChecksum,
                filename,
                contentType: fileMimeType,
                data: fileBuffer.toString('base64'),
                createdAt: chat.timestamp,
            });

            chat.messages[messageIndex].mediaKeys.push(mediaFile[EntityId]);
        }

        // Create users
        const createdUsers: Record<string, any>[] = [];
        for (const user of users) {
            createdUsers.push(await saveNewUser(user.username, user.password));
        }

        // Create chats
        for (const chat of chats) {
            const userKey = createdUsers.find(user => user.username === chat.username)![EntityId] as string;

            if (userKey) {
                const {newChat, newChatKey} = await createChat(userKey, {
                    title: chat.title,
                    text: chat.text,
                    mediaKeys: chat.mediaKeys
                }, chat.timestamp);

                // Add chat participants
                newChat.participantsKeys = newChat.participantsKeys.concat(chat.otherParticipants.map(username => createdUsers.find(user => user.username === username)![EntityId] as string));
                await chatRepository.save(newChat[EntityId], newChat);

                // Create messages
                for (const message of chat.messages) {
                    const authorKey = createdUsers.find(user => user.username === message.username)![EntityId] as string;
                    const newMessage = await messageRepository.save({
                        senderKey: authorKey,
                        text: message.text,
                        mediaKeys: message.mediaKeys,
                        updatedAt: chat.timestamp + message.createdAtOffset,
                    });
                    await addMessageToSortedSet(newChatKey, chat.timestamp + message.createdAtOffset, newMessage[EntityId]);
                }
            }
        }

        // Finish
        await redisQueryClient.set('db-initialized', 'true');
        console.log("DB initialization finished successfully!");
    } catch (error) {
        console.log("DB initialization failed! Error: ", error);
    }
}