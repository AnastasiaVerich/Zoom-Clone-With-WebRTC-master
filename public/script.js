const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  console.log('getUserMedia')
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    console.log('ANSWER')
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
      console.log('ANSWER')
    })
  })

  socket.on('user-connected', userId => {
    console.log('user-connected')
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  console.log('join-room')
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  setTimeout(()=>{
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log('stream')
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      video.remove()
    })
  
    peers[userId] = call
  },3000)
 
}

function addVideoStream(video, stream) {
  window.streemmm = stream
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}