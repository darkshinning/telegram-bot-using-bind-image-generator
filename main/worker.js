import {getStatus, statusOfDialogue} from "./dialogueStatus";
import {generateImagesLinks} from './bindImageGenerator'

const token = '' // telegram token
const master_id = '' // telegram main chat id to send important messages

const keyboards = {
    main_menu: {
        start: {
            keyboard: [
                [{text: "Start 👺"}, {text: "Создать 😎"}]
            ],
            is_persistent: false,
            resize_keyboard: true,
            input_field_placeholder: "Эльдар лох!"
        },
        description: {
            keyboard: [
                [{text: "Назад 🫦"}]
            ],
            is_persistent: false,
            resize_keyboard: true,
            input_field_placeholder: '"Арсен тоже лох..'
        },
    }
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
async function handleRequest(request) {
    if(request.method === 'POST'){
        let data = await request.json()
        if(data.message !== undefined){
            await handlemessage(data.message)
        } else if(data.callback_query !== undefined){
            handleinline(data.callback_query)
        }
    }
    return new Response('ok', {status: 200})
}
async function handlemessage(d) {
    let chat_id = d.chat.id
    let status = await getStatus(chat_id)

    if (d.text !== undefined) {
        let text = d.text
        let otext = text.split(' ')

        if (status === 'start') {
            switch (otext[0]) {
                case '/start':
                case 'Start':
                    await tg(token, 'sendmessage', {
                        chat_id: chat_id,
                        text: 'Flex! 🤖🤖🤖🤖',
                        reply_markup: keyboards.main_menu.start
                    })
                    break
                case 'Создать':
                case '/create':
                    await statusOfDialogue(chat_id, 'bind')
                    await tg(token, 'sendmessage', {
                        chat_id: chat_id,
                        text: 'Отправьте описание!',
                        reply_markup: keyboards.main_menu.description
                    })
                    break
                default:
                    await tg(token, 'sendmessage', {
                        chat_id: chat_id,
                        text: "Ладно."
                    })
            }
        }
        else if (status === 'bind') {
            await statusOfDialogue(chat_id, 'start')

            try {
                const imageLinks = await generateImagesLinks(text)
                let media =
                    [{
                        type: 'photo',
                        media: imageLinks[0]
                    }, {
                        type: 'photo',
                        media: imageLinks[1]
                    }, {
                        type: 'photo',
                        media: imageLinks[2]
                    },{
                        type: 'photo',
                        media: imageLinks[3]
                    }]
                await tg(token, 'sendMediaGroup', {
                    chat_id: chat_id,
                    media: media
                })
                await tg(token, 'sendmessage', {
                    chat_id: chat_id,
                    text: text
                })
            } catch (error) {
                if (error.response) {
                    await tg(token, 'sendmessage', {
                        chat_id: chat_id,
                        text: error.response.data + '\n\n' + error.response.status
                    })
                } else {
                    await tg(token, 'sendmessage', {
                        chat_id: chat_id,
                        text: error.message
                    })
                }
            }

            await tg(token, 'sendmessage', {
                chat_id: chat_id,
                text: 'Ну как тебе?',
                reply_markup: keyboards.main_menu.start
            })
        }
        else {
            await statusOfDialogue(chat_id, 'start')
            await tg(token, 'sendmessage', {
                chat_id: chat_id,
                text: 'Ты сломал диалог. Красавчик! Начинай все заново...'
            })
        }
    }
    else {
        await tg(token, 'sendmessage', {
            chat_id: chat_id,
            text: 'Отправьте только текстовое сообщение!'
        })
    }
}

async function handleinline(d) {
    switch (d.data) {
        case "Adding":
            // await tg(token, 'sendmessage', {
            //     chat_id: chat_id,
            //     text: 'Flex! 🤖🤖🤖🤖',
            //     reply_markup: keyboards.main_menu.start
            // })
            await tg(token,'answerCallbackQuery',{
                callback_query_id: d.id,
                text: "Я бля еще не закончил нах",
                show_alert: true
            })
    }

}

async function tg(token,type,data,n = true){
    try {
        let t = await fetch('https://api.telegram.org/bot' + token + '/' + type,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        let d = await t.json()
        if(!d.ok && n)
            throw d
        else
            return d
    }catch(e){
        await tg(token,'sendmessage',{
            chat_id: master_id,
            text: 'Request tg error\n\n' /**+ JSON.stringify(data) + '\n\n' */ + JSON.stringify(e)
        },false)
        return e
    }
}