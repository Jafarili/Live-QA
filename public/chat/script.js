$(document).ready(function () {
    var name = "Anonymous";
    var roomID;
    var socket;
    var messages = {};

    initSetup();
    connectToServer();

    function drawMessages() {
        let chatMessagesElm = $('#chat-messages');
        for (let message of Object.values(messages)) {
            let existingChatMessage = $(`#message-${message.id}`);
            if (existingChatMessage.length) {
                continue;
            }
            const messageElement = $(`<div class="message" id="message-${message.id}"><span class="name">${escapeHtml(message.name)}:</span>${escapeHtml(message.message)}<time class="timeago text-muted" datetime="${new Date(message.time)}" title="${new Date(message.time)}"></time></div>`);
            chatMessagesElm.append(messageElement);
        }
        $("html, body").scrollTop($(document).height());
        $("time.timeago").timeago();
    }

    function connectToServer() {
        socket = new WebSocket('wss://q-a.live/ws?id=' + roomID);

        socket.onopen = function (event) {
            console.log('Connected to server');
        };

        socket.onmessage = function (event) {
            const message = JSON.parse(event.data);
            messages[message.id] = message;
            drawMessages();
        };

        socket.onclose = function (event) {
            setTimeout(
                function () {
                    connectToServer();
                },
                1000
            );
        };
    }

    function initSetup() {
        const path = window.location.pathname;
        if (path.match(/^(\/[ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{6})$/gm) === null) {
            // redirect to home page
            window.location.href = '/';
            return;
        }
        roomID = path.substring(1);

        if (document.cookie.split(';').some((item) => item.trim().startsWith('name='))) {
            name = document.cookie.replace(/(?:(?:^|.*;\s*)name\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        }

        $('#invite-link').val(window.location.href);

        const changeNameModal = new bootstrap.Modal('#name-modal', {
            keyboard: false
        })

        $('#name-prefix').text(name + ":");

        $('#change-name-save').click(function () {
            name = $('#change-name-input').val();
            if (name === '') {
                return;
            }
            $('#name-prefix').text(name + ":");
            changeNameModal.hide();
            document.cookie = `name=${name}; max-age=31536000; path=/`;
        });

        document.getElementById('name-modal').addEventListener('shown.bs.modal', () => {
            $('#change-name-input').val(name);
        });

        $('#send-message').click(function () {
            const message = $('#message-input').val();
            if (message === '') {
                return;
            }
            socket.send(JSON.stringify({
                id: uuidv4(),
                name: name,
                message: message,
                time: Date.now()
            }));
            $('#message-input').val('');
        });

        $('#copy-invite-link').click(function () {
            var copyText = document.getElementById("invite-link");
            copyText.select();
            copyText.setSelectionRange(0, 99999); // For mobile devices
            navigator.clipboard.writeText(copyText.value);
        });

        setInterval(function () {
            $("time.timeago").timeago();
        }, 60000);

        setTimeout(function () {
            if (Object.keys(messages).length === 0) {
                const inviteModal = new bootstrap.Modal('#invite-modal', {
                    keyboard: false
                })
                inviteModal.show();
            }
        }, 1000);
    }
});

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}