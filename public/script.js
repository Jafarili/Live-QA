document.addEventListener('DOMContentLoaded', () => {
    const roomForm = document.getElementById('room-form');
    const createRoomButton = document.getElementById('create-room');
    const roomCodeInput = document.getElementById('room-code');

    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomCode = roomCodeInput.value.trim().toUpperCase();
        if (roomCode.length === 6) {
            window.location.href = `/${roomCode}`;
        } else {
            alert('Please enter a valid 6-character room code!');
        }
    });

    // Handle creating a new room
    createRoomButton.addEventListener('click', () => {
        const newRoomCode = generateRoomCode();
        window.location.href = `/${newRoomCode}`;
    });

    // Generate a random 6-character room code
    function generateRoomCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }
});
