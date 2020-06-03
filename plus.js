(async function main() {
    //表示するルーム名
    const displayName = document.getElementById('room_name');
    //選択したルーム
    const roomName = sessionStorage.getItem('name_key');
    //表示するルームタイプ(テスト用)
    const displayType = document.getElementById('room_type');
    //選択したルームタイプ
    const roomType = sessionStorage.getItem('type_key');
    //ステータス
    const roomStatus = document.getElementById('room_status');

    //ミュート(マイク)ボタン
    const muteButton = document.getElementById('bt_mute');
    //ミュートボタン用音声
    const poti = document.getElementById('sound_file');
    //カメラボタン
    const micButton = document.getElementById('bt_mic');
    //退室ボタン
    const exitButton = document.getElementById('bt_exit');

    //自分の映像
    const localVideo = document.getElementById('local_stream');
    //自分以外の映像
    const remoteVideos = document.getElementById('remote_streams');


    //デバック用peer表示
    const displayPeer = document.getElementById('display_peer');

    //ルーム名を表示
    displayName.textContent = 'ROOM : ' + roomName;
    //ルームタイプを表示
    displayType.textContent = 'TYPE : ' + roomType;

    //自分の映像と音声をlocalStreamに代入
    const localStream = await navigator.mediaDevices
        .getUserMedia({
        audio: true,
        video: true,
        })
        .catch(console.error);

    
    //localStreamをlocalVideoに挿入
    localVideo.muted = true;
    localVideo.srcObject = localStream;
    localVideo.playsInline = true;
    await localVideo.play().catch(console.error); 

    //Peer作成
    //シグナリンサーバへ接続
    const peer = new Peer
    ({
        key: '66b26037-ac91-4937-b106-1c25749dfc74',
        debug: 3
    });

    //PeerID取得
    peer.on('open', () =>
    {
        displayPeer.textContent = 'デバック用 : ' + peer.id;

        //ルーム接続
        //部屋に接続するメソッド（joinRoom）
        const room = peer.joinRoom(roomName, 
            {
                mode: roomType,
                stream: localStream,
            });

        //部屋に接続できた時(open)にステータスに表示
        room.once('open', () => 
        {
            roomStatus.textContent = 'ルーム ' + roomName+ ' に入室しました！';
        });    
        
        //streamの内容に変更があった時videoタグを作って流す
        room.on('stream', async stream => {
            const newVideo = document.createElement('video');
            newVideo.srcObject = stream;
            newVideo.playsInline = true;
            //誰かが退出した時どの人が退出したかわかるように、data-peer-idを付与
            newVideo.setAttribute('data_peerId', stream.peerId);
            //サイズを設定
            newVideo.width = '300';
            remoteVideos.append(newVideo);
            await newVideo.play().catch(console.error);
        });


        //退室ボタンを押すとroom.close()を発動
        exitButton.addEventListener('click', () => room.close(), { once: true });
        //自分が退出した場合の処理
        room.once('close', () => 
        {
            //remoteVideos以下の全てのvideoタグのストリームを停めてから削除
            Array.from(remoteVideos.children).forEach(remoteVideo => {
            remoteVideo.srcObject.getTracks().forEach(track => track.stop());
            remoteVideo.srcObject = null;
            remoteVideo.remove();
            });


            //前のページの戻る
            history.back();

        });
    });

    
    //ミュートボタン判定フラグ
    //true マイクオン、false マイクオフ(ミュート)
    var micFlag = false;

    //ミュートボタンが押されたときの処理
    muteButton.addEventListener('click', muteButtonListener)
    function muteButtonListener()
    {
        //ボタンの画像を変える
        //trueだったら
        if(micFlag)
        {
            //画像をオフに
            muteButton.src = 'images/icon_mute.png';
            micFlag = false;
        }   
        //falseだったら
        else if(!micFlag)
        {
            //画像をオンに
            muteButton.src = 'images/icon_mic.png';
            micFlag = true;
        }
        
        //初回以外だったら音を巻き戻す
        if(poti.currentTime != undefined)
        {
            poti.currentTime = 0;
        }
        //音を再生する
        poti.play();
    }

})();
