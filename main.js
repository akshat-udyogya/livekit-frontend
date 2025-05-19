import {
  Room,
  Participant,
  createLocalVideoTrack,
  createLocalAudioTrack,
  connect,
} from 'https://esm.sh/@livekit/client';

const room = new Room();
let localParticipant;
let localTracks = [];
let isMicOn = true;
let facingMode = 'user'; // front camera

async function joinRoom() {
  const params = new URLSearchParams(window.location.search);
  const identity = params.get('identity') || 'guest';
  const roomName = params.get('room') || 'default';

  // Get token
  const res = await fetch('https://livekit-yg67.onrender.com/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity, roomName }),
  });
  const { token } = await res.json();

  // Create local tracks
  const videoTrack = await createLocalVideoTrack({ facingMode });
  const audioTrack = await createLocalAudioTrack();
  localTracks = [audioTrack, videoTrack];

  await connect(room, token, {
    tracks: localTracks,
  });

  localParticipant = room.localParticipant;

  const videoEl = document.getElementById('video');
  videoTrack.attach(videoEl);
}

joinRoom();

// Controls
document.getElementById('mic').addEventListener('click', () => {
  isMicOn = !isMicOn;
  localTracks[0].enabled = isMicOn;
  document.getElementById('mic').textContent = isMicOn ? 'Mute' : 'Unmute';
});

document.getElementById('cam').addEventListener('click', async () => {
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  const newTrack = await createLocalVideoTrack({ facingMode });
  localTracks[1].stop();
  localTracks[1] = newTrack;
  const videoEl = document.getElementById('video');
  newTrack.attach(videoEl);
  localParticipant.publishTrack(newTrack);
});

document.getElementById('leave').addEventListener('click', () => {
    room.disconnect();
  });

try {
  const res = await fetch('https://livekit-yg67.onrender.com/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity, roomName }),
  });
  const data = await res.json();
  console.log("Received token:", data);
  const token = data.token;

  const videoTrack = await createLocalVideoTrack({ facingMode });
  const audioTrack = await createLocalAudioTrack();
  localTracks = [audioTrack, videoTrack];
  console.log("Tracks created");

  await connect(room, token, {
    tracks: localTracks,
  });
  console.log("Connected to room");

  localParticipant = room.localParticipant;
  const videoEl = document.getElementById('video');
  videoTrack.attach(videoEl);
} catch (err) {
  console.error("Error joining room:", err);
}

  
