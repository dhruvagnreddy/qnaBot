// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');

const sdk = require("microsoft-cognitiveservices-speech-sdk");

var subscriptionKey = "3b187997-5105-45ff-aa57-83aeb8a5d52c";
var serviceRegion = "East US";



class QnABot extends ActivityHandler {
    constructor() {
        super();

        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAEndpointKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        }

        // If a new user is added to the conversation, send them a greeting message
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Welcome to the QnA Maker sample! Ask me a question and I will try to answer it.');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // When a user sends a message, perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
        this.onMessage(async (context, next) => {
            if (!process.env.QnAKnowledgebaseId || !process.env.QnAEndpointKey || !process.env.QnAEndpointHostName) {
                const unconfiguredQnaMessage = 'NOTE: \r\n' +
                    'QnA Maker is not configured. To enable all capabilities, add `QnAKnowledgebaseId`, `QnAEndpointKey` and `QnAEndpointHostName` to the .env file. \r\n' +
                    'You may visit www.qnamaker.ai to create a QnA Maker knowledge base.';

                await context.sendActivity(unconfiguredQnaMessage);
            } else {
                console.log('Calling QnA Maker');

                const qnaResults = await this.qnaMaker.getAnswers(context);

                // If an answer was received from QnA Maker, send the answer back to the user.
                if (qnaResults[0]) {
                    await context.sendActivity(qnaResults[0].answer);
                    this.fun(qnaResults[0].answer);

                // If no answers were returned from QnA Maker, reply with help.
                } else {
                    await context.sendActivity('No QnA Maker answers were found.');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

    }

    fun(s) {
        console.log(s);
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
        var speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
        var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        synthesizer.speakTextAsync(
        "Synthesizing directly to speaker output.",
        result => {
            if (result) {
                synthesizer.close();
                return result.audioData;
            }
        },
        error => {
            console.log(error);
            synthesizer.close();
        });
    }



        synthesizeSpeech() {
            const speechConfig = sdk.SpeechConfig.fromSubscription("3b187997-5105-45ff-aa57-83aeb8a5d52c", "East US");
            const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();

            const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
            synthesizer.speakTextAsync(
                "Synthesizing directly to speaker output.",
                result => {
                    if (result) {
                        synthesizer.close();
                        return result.audioData;
                    }
                },
                error => {
                    console.log(error);
                    synthesizer.close();
                });
        }


}

module.exports.QnABot = QnABot;
