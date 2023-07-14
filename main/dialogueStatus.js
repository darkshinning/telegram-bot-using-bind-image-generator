import {createClient} from '@supabase/supabase-js'

const D_URL = '' // supabase api
const D_API = '' // supabase api
export async function statusOfDialogue(chat_id, status) {
    const supabase = createClient(D_URL, D_API)

    let { data } = await supabase
        .from('dialog')
        .select(`status`)
        .eq('chat_id', chat_id).single()
    if (data === null) {
        const stat = {
            chat_id: chat_id,
            status: status
        }
        await supabase
            .from('dialog')
            .insert(stat)
    }
    else {
        const stat = {status: status}
        await supabase
            .from('dialog')
            .update(stat)
            .eq('chat_id', chat_id)
    }
}

export async function getStatus(chat_id) {
    const supabase = createClient(D_URL, D_API)

    let { data }  = await supabase
        .from('dialog')
        .select(`status`)
        .eq(`chat_id`, chat_id)

    if (data.length !== 0) {
        let status = JSON.stringify(data)
        let stat = JSON.parse(status)
        return stat[0].status
    }
    else {
        return 'start'
    }
}
