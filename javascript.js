    // ===== DAFTAR LAGU =====
    // Taruh file musik di folder "music/", lalu tulis di sini.
    const playlist = [
      { title: "1. In The Summer - Delta Force", src: "Music/1. In The Summer - Delta Force.mp3" },
      { title: "2. Dawn - Delta Force", src: "Music/2. Dawn - Delta Force.mp3" },
      { title: "3. Hackclaw Inky Reflections Theme Song Got You Music Video - Delta Force", src: "Music/3. Hackclaw Inky Reflections Theme Song Got You Music Video - Delta Force.mp3" },
      { title: "4. Luna × Schwarz·Skyline Theme Song (Delta Force x Arknights)", src: "Music/4. Luna × Schwarz·Skyline Theme Song (Delta Force x Arknights).mp3" },
      { title: "5. SPOTLIGHT HUNTER (Delta Force x Arknights)", src: "Music/5. SPOTLIGHT HUNTER (Delta Force x Arknights).mp3" },
      { title: "6. Toxik × Exusiai·Midnight Delivery Theme Song - POSTER GIRL (Delta Force × Arknights)", src: "Music/6. Toxik × Exusiai·Midnight Delivery Theme Song - POSTER GIRL (Delta Force × Arknights).mp3" },
      { title: "7. Beyond the Stars - Delta Force", src: "Music/7. Beyond the Stars - Delta Force.mp3" },
      { title: "8. Fury Theme Song - Delta Force", src: "Music/8. Fury Theme Song - Delta Force.mp3" },
      { title: "9. LAMENT Theme Song - Delta Force", src: "Music/9. LAMENT Theme Song - Delta Force.mp3" }
    ];

    const PLAY_ICON = '<svg viewBox="0 0 24 24"><path d="M7 4.5v15L20 12z"/></svg>';
    const PAUSE_ICON = '<svg viewBox="0 0 24 24"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>';

    const audio = document.getElementById("audio");
    const player = document.getElementById("player");
    const titleEl = document.getElementById("musicTitle");
    const btnMenu = document.getElementById("btnMenu");
    const btnPlay = document.getElementById("btnPlay");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const btnLike = document.getElementById("btnLike");
    const btnShuffle = document.getElementById("btnShuffle");
    const btnLoop = document.getElementById("btnLoop");
    const seekBar = document.getElementById("seekBar");
    const volumeBar = document.getElementById("volumeBar");
    const timeNow = document.getElementById("timeNow");
    const timeTotal = document.getElementById("timeTotal");
    const listEl = document.getElementById("musicList");

    let current = 0;
    let shuffle = false;
    let loop = false;
    let seeking = false;
    let liked = {};

    // Lagu yang disukai disimpan di browser pengunjung (kalau tersedia)
    try { liked = JSON.parse(localStorage.getItem("likedTracks") || "{}"); } catch (e) { liked = {}; }

    function formatTime(sec) {
      if (!isFinite(sec)) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, "0");
      return m + ":" + s;
    }

    function renderList() {
      listEl.innerHTML = "";
      playlist.forEach(function (t, i) {
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = t.title;
        if (i === current) b.className = "now";
        b.addEventListener("click", function () { loadTrack(i); play(); });
        li.appendChild(b);
        listEl.appendChild(li);
      });
    }

    function updateLike() {
      const on = !!liked[playlist[current].src];
      btnLike.classList.toggle("on", on);
      btnLike.setAttribute("aria-pressed", on);
    }

    function loadTrack(index) {
      current = (index + playlist.length) % playlist.length;
      audio.src = playlist[current].src;
      titleEl.textContent = playlist[current].title;
      seekBar.value = 0;
      timeNow.textContent = "0:00";
      timeTotal.textContent = "0:00";
      renderList();
      updateLike();
    }

    function play() {
      // Browser hanya mengizinkan suara setelah pengguna menekan sesuatu
      audio.play().catch(function () {
        titleEl.textContent = "Tidak bisa memutar: " + playlist[current].title;
      });
    }

    function togglePlay() {
      if (audio.paused) play(); else audio.pause();
    }

    function nextTrack() {
      if (shuffle && playlist.length > 1) {
        let n;
        do { n = Math.floor(Math.random() * playlist.length); } while (n === current);
        loadTrack(n);
      } else {
        loadTrack(current + 1);
      }
      play();
    }

    function prevTrack() {
      // Jika sudah lewat 3 detik, ulang lagu dari awal
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
      } else {
        loadTrack(current - 1);
        play();
      }
    }

    btnPlay.addEventListener("click", togglePlay);
    btnNext.addEventListener("click", nextTrack);
    btnPrev.addEventListener("click", prevTrack);

    btnMenu.addEventListener("click", function () {
      const open = player.classList.toggle("open");
      btnMenu.setAttribute("aria-expanded", open);
    });

    btnLike.addEventListener("click", function () {
      const key = playlist[current].src;
      if (liked[key]) delete liked[key]; else liked[key] = true;
      try { localStorage.setItem("likedTracks", JSON.stringify(liked)); } catch (e) {}
      updateLike();
    });

    btnShuffle.addEventListener("click", function () {
      shuffle = !shuffle;
      btnShuffle.classList.toggle("on", shuffle);
      btnShuffle.setAttribute("aria-pressed", shuffle);
    });

    btnLoop.addEventListener("click", function () {
      loop = !loop;
      audio.loop = loop;
      btnLoop.classList.toggle("on", loop);
      btnLoop.setAttribute("aria-pressed", loop);
    });

    audio.addEventListener("play", function () {
      btnPlay.innerHTML = PAUSE_ICON;
      btnPlay.setAttribute("aria-label", "Jeda");
    });

    audio.addEventListener("pause", function () {
      btnPlay.innerHTML = PLAY_ICON;
      btnPlay.setAttribute("aria-label", "Putar");
    });

    audio.addEventListener("loadedmetadata", function () {
      timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", function () {
      if (seeking || !audio.duration) return;
      seekBar.value = (audio.currentTime / audio.duration) * 100;
      timeNow.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener("ended", nextTrack);

    // Jika file lagu tidak ditemukan, tampilkan pesan
    audio.addEventListener("error", function () {
      titleEl.textContent = "File tidak ditemukan: " + playlist[current].src;
    });

    // Geser posisi lagu
    seekBar.addEventListener("input", function () {
      seeking = true;
      if (audio.duration) {
        timeNow.textContent = formatTime((seekBar.value / 100) * audio.duration);
      }
    });

    seekBar.addEventListener("change", function () {
      if (audio.duration) {
        audio.currentTime = (seekBar.value / 100) * audio.duration;
      }
      seeking = false;
    });

    // Volume
    audio.volume = parseFloat(volumeBar.value);
    volumeBar.addEventListener("input", function () {
      audio.volume = parseFloat(volumeBar.value);
    });

    // Pintasan keyboard: spasi = putar/jeda (tidak aktif saat fokus di tombol/slider)
    document.addEventListener("keydown", function (e) {
      const tag = e.target.tagName;
      if (e.code === "Space" && tag !== "BUTTON" && tag !== "INPUT" && tag !== "A") {
        e.preventDefault();
        togglePlay();
      }
    });

    loadTrack(0);