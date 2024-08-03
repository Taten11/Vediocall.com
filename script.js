const socket = io('/');
const videoGrid = document.getElementById('videos');
const myPeer = new SimplePeer({ initiator: location.hash === '#init', trickle: false });
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('signal', data => {
        socket.emit('join-room', ROOM_ID, data);
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close();
    });
});

myPeer.on('stream', stream => {
    const video = document.createElement('video');
    addVideoStream(video, stream);
});

socket.on('user-connected', userId => {
    console.log('User connected: ' + userId);
});

socket.on('signal', (data, userId) => {
    const peer = new SimplePeer({ initiator: false, trickle: false });
    peer.signal(data);
    peers[userId] = peer;

    peer.on('stream', stream => {
        const video = document.createElement('video');
        addVideoStream(video, stream);
    });

    peer.on('close', () => {
        video.remove();
    });
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
