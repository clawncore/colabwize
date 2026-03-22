import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
const channel = supabase.channel('room-1')

console.log('Methods on channel:')
console.log(Object.keys(channel.__proto__))
console.log(channel.send.toString())
if (channel.httpSend) {
  console.log('httpSend exists! ', channel.httpSend.toString())
} else {
  console.log('httpSend does NOT exist')
}
