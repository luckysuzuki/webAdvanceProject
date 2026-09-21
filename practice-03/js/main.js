/* ==========================================================================
   学习通 · 网页端界面复刻  —  公共交互脚本
   仅使用原生 JavaScript，无任何框架 / 库依赖。
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     工具函数
     ------------------------------------------------------------------ */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function toast(msg, type) {
    var el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.className = 'toast'; }, 2200);
  }

  /* 读取 localStorage 中的用户列表与登录态（演示用，非真实鉴权） */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('xxUsers') || '[]'); }
    catch (e) { return []; }
  }
  function saveUsers(list) { localStorage.setItem('xxUsers', JSON.stringify(list)); }

  function currentUser() {
    var name = localStorage.getItem('xxLoggedIn');
    var data = window.APP_DATA.user;
    return { name: name || data.name, role: data.role, code: data.code, school: data.school };
  }

  /* ------------------------------------------------------------------
     页面外壳：顶部导航 + 用户信息 + 高亮当前栏目
     ------------------------------------------------------------------ */
  function initShell() {
    var u = currentUser();
    var uname = $('.user-name');
    if (uname) uname.textContent = u.name;
    var ucode = $('.user-code');
    if (ucode) ucode.textContent = u.school + ' · ' + u.code;
    var avatar = $('.avatar');
    if (avatar) avatar.textContent = u.name.charAt(0);

    // 高亮当前导航项
    var page = document.body.getAttribute('data-page');
    $$('.nav-tab').forEach(function (tab) {
      if (tab.getAttribute('data-nav') === page) tab.classList.add('active');
    });

    // 退出登录
    var logoutBtn = $('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('xxLoggedIn');
        toast('已退出登录', 'success');
        setTimeout(function () { location.href = 'index.html'; }, 600);
      });
    }

    // 头像 / 姓名点击也可退出（下拉简单处理）
    var userBox = $('#userBox');
    if (userBox) {
      userBox.addEventListener('click', function () {
        if (confirm('是否退出当前账号？')) {
          localStorage.removeItem('xxLoggedIn');
          location.href = 'index.html';
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     状态映射
     ------------------------------------------------------------------ */
  var HW_STATUS = {
    done:    { text: '已批改', cls: 'ok' },
    todo:    { text: '未提交', cls: 'warn' },
    grading: { text: '待批改', cls: 'info' }
  };
  var EXP_STATUS = {
    done:  { text: '已完成', cls: 'ok' },
    doing: { text: '进行中', cls: 'info' },
    todo:  { text: '未开始', cls: 'gray' }
  };

  function badge(status, map) {
    var s = map[status] || { text: status, cls: 'gray' };
    return '<span class="badge ' + s.cls + '">' + s.text + '</span>';
  }

  /* ------------------------------------------------------------------
     首页渲染
     ------------------------------------------------------------------ */
  function renderHome() {
    var D = window.APP_DATA;
    var u = currentUser();

    // 欢迎语
    var hero = $('#heroTitle');
    if (hero) hero.textContent = '你好，' + u.name + '，欢迎回来！';
    var heroSub = $('#heroSub');
    if (heroSub) heroSub.textContent = '你共有 ' + D.courses.length + ' 门课程在进行中，今天也要加油学习哦。';

    // 统计卡片
    var todoCount = D.homework.filter(function (h) { return h.status === 'todo'; }).length;
    var doingExp = D.experiments.filter(function (e) { return e.status === 'doing' || e.status === 'todo'; }).length;
    var total = D.grades.map(function (g) { return gradeScore(g); });
    var avg = Math.round(total.reduce(function (a, b) { return a + b; }, 0) / total.length);

    setStat('stat-course', D.courses.length);
    setStat('stat-homework', todoCount);
    setStat('stat-experiment', doingExp);
    setStat('stat-grade', avg);

    // 课程卡片
    var grid = $('#courseGrid');
    if (grid) grid.innerHTML = D.courses.map(function (c) {
      return '' +
        '<div class="course-card">' +
          '<div class="course-cover ' + c.cover + '">' +
            '<span class="cover-tag">' + c.chapters + ' 章 · 已完成 ' + c.finished + '</span>' +
          '</div>' +
          '<div class="course-body">' +
            '<h3 class="course-name ellipsis">' + c.name + '</h3>' +
            '<span class="course-teacher">授课教师：' + c.teacher + '</span>' +
            '<div class="progress-row">' +
              '<div class="progress"><i style="width:' + c.progress + '%"></i></div>' +
              '<span class="pct">' + c.progress + '%</span>' +
            '</div>' +
            '<div class="course-foot"><span>学习进度</span><a href="homework.html">查看作业 →</a></div>' +
          '</div>' +
        '</div>';
    }).join('');

    // 通知公告
    var notice = $('#noticeList');
    if (notice) notice.innerHTML = D.notices.map(function (n) {
      return '<li>' +
        '<span class="notice-tag ' + n.tag + '">' + n.tagText + '</span>' +
        '<a class="notice-title ellipsis" href="javascript:;">' + n.title + '</a>' +
        '<span class="notice-date">' + n.date + '</span>' +
      '</li>';
    }).join('');
  }

  function setStat(id, val) {
    var el = $('#' + id);
    if (el) el.textContent = val;
  }

  /* 总评成绩 = 平时30% + 实验30% + 期末40% */
  function gradeScore(g) {
    return Math.round(g.usual * 0.3 + g.lab * 0.3 + g.final * 0.4);
  }

  /* ------------------------------------------------------------------
     作业渲染
     ------------------------------------------------------------------ */
  function renderHomework(filter) {
    var D = window.APP_DATA;
    var list = D.homework.slice();
    if (filter && filter !== 'all') {
      list = list.filter(function (h) { return h.status === filter; });
    }
    var tbody = $('#homeworkBody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><div class="ico">📭</div>暂无相关作业</div></td></tr>';
      return;
    }
    tbody.innerHTML = list.map(function (h) {
      var scoreCell = h.score ? h.score + ' 分' : '—';
      return '<tr class="row-link">' +
        '<td><div class="cell-main">' + h.name + '</div><div class="cell-sub">' + h.course + '</div></td>' +
        '<td>' + badge(h.status, HW_STATUS) + '</td>' +
        '<td>' + h.deadline + '</td>' +
        '<td>' + scoreCell + '</td>' +
        '<td><a class="btn btn-ghost" style="padding:5px 14px" href="javascript:;" onclick="XLS.viewHomework(' + h.id + ')">查看</a></td>' +
      '</tr>';
    }).join('');
  }

  function viewHomework(id) {
    var h = window.APP_DATA.homework.filter(function (x) { return x.id === id; })[0];
    if (!h) return;
    toast('《' + h.name + '》' + (h.status === 'done' ? ' 得分 ' + h.score + ' 分' : ' 待提交，截止 ' + h.deadline), 'success');
  }

  /* ------------------------------------------------------------------
     实验渲染
     ------------------------------------------------------------------ */
  function renderExperiments(filter) {
    var D = window.APP_DATA;
    var list = D.experiments.slice();
    if (filter && filter !== 'all') {
      list = list.filter(function (e) { return e.status === filter; });
    }
    var tbody = $('#experimentBody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><div class="ico">🧪</div>暂无相关实验</div></td></tr>';
      return;
    }
    tbody.innerHTML = list.map(function (e) {
      var btn = e.status === 'done'
        ? '<a class="btn btn-ghost" style="padding:5px 14px" href="javascript:;">查看报告</a>'
        : '<a class="btn btn-primary" style="padding:5px 14px" href="javascript:;" onclick="XLS.viewExperiment(' + e.id + ')">去做实验</a>';
      return '<tr>' +
        '<td><div class="cell-main">' + e.name + '</div><div class="cell-sub">' + e.course + '</div></td>' +
        '<td>' + badge(e.status, EXP_STATUS) + '</td>' +
        '<td>' + e.deadline + '</td>' +
        '<td>' + e.report + '</td>' +
        '<td>' + btn + '</td>' +
      '</tr>';
    }).join('');
  }

  function viewExperiment(id) {
    var e = window.APP_DATA.experiments.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    toast('正在进入《' + e.name + '》实验环境……', 'success');
  }

  /* ------------------------------------------------------------------
     成绩统计渲染
     ------------------------------------------------------------------ */
  function renderGrades() {
    var D = window.APP_DATA;
    var scores = D.grades.map(gradeScore);
    var avg = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
    var max = Math.max.apply(null, scores);
    var min = Math.min.apply(null, scores);
    var credit = D.grades.reduce(function (a, g) { return a + g.credit; }, 0);

    setStat('grade-avg', avg);
    setStat('grade-max', max);
    setStat('grade-min', min);
    setStat('grade-credit', credit.toFixed(1));

    // 明细表
    var tbody = $('#gradeBody');
    if (tbody) {
      tbody.innerHTML = D.grades.map(function (g) {
        var total = gradeScore(g);
        var gpa = total >= 90 ? '4.0' : total >= 85 ? '3.7' : total >= 80 ? '3.3' : total >= 75 ? '2.7' : total >= 70 ? '2.0' : '1.0';
        return '<tr>' +
          '<td class="cell-main">' + g.course + '</td>' +
          '<td>' + g.usual + '</td>' +
          '<td>' + g.lab + '</td>' +
          '<td>' + g.final + '</td>' +
          '<td style="color:var(--brand);font-weight:600">' + total + '</td>' +
          '<td>' + gpa + '</td>' +
        '</tr>';
      }).join('');
    }

    // 图表
    drawGradeBar(D.grades.map(function (g) { return g.course; }), scores);
    drawTrend(D.trend);
  }

  /* ------------------------------------------------------------------
     图表（原生 Canvas 绘制，无第三方库）
     ------------------------------------------------------------------ */
  function setupCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    var w = Math.max(rect.width, 280);
    var h = parseInt(canvas.getAttribute('data-height') || '300', 10);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function drawGradeBar(labels, values) {
    var canvas = $('#gradeBarChart');
    if (!canvas) return;
    var c = setupCanvas(canvas);
    var ctx = c.ctx, w = c.w, h = c.h;
    var padL = 38, padR = 16, padT = 24, padB = 44;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var maxV = 100;

    ctx.clearRect(0, 0, w, h);

    // Y 轴网格线 + 刻度
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#9aa6b6';
    ctx.textAlign = 'right';
    for (var g = 0; g <= 4; g++) {
      var v = g * 25;
      var y = padT + plotH - (v / maxV) * plotH;
      ctx.strokeStyle = '#eef1f6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      ctx.fillText(String(v), padL - 8, y + 4);
    }

    // 柱状图
    var n = labels.length;
    var gap = 14;
    var bw = (plotW - gap * (n - 1)) / n;
    labels.forEach(function (label, i) {
      var v = values[i];
      var barH = (v / maxV) * plotH;
      var x = padL + i * (bw + gap);
      var y = padT + plotH - barH;
      var grd = ctx.createLinearGradient(0, y, 0, y + barH);
      grd.addColorStop(0, '#4f9bf0');
      grd.addColorStop(1, '#2b7de9');
      ctx.fillStyle = grd;
      ctx.beginPath();
      roundRect(ctx, x, y, bw, barH, { tl: 5, tr: 5 });
      ctx.fill();

      // 数值标签
      ctx.fillStyle = '#5b6a7f';
      ctx.textAlign = 'center';
      ctx.font = '11px sans-serif';
      ctx.fillText(String(v), x + bw / 2, y - 7);

      // X 轴标签（过长省略）
      ctx.fillStyle = '#9aa6b6';
      ctx.fillText(shorten(label, 7), x + bw / 2, padT + plotH + 18);
    });

    // 基线
    ctx.strokeStyle = '#d7dfec';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH);
    ctx.lineTo(w - padR, padT + plotH);
    ctx.stroke();
  }

  function drawTrend(trend) {
    var canvas = $('#trendChart');
    if (!canvas) return;
    var c = setupCanvas(canvas);
    var ctx = c.ctx, w = c.w, h = c.h;
    var padL = 38, padR = 16, padT = 24, padB = 40;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var maxV = 100;

    ctx.clearRect(0, 0, w, h);

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (var g = 0; g <= 4; g++) {
      var v = g * 25;
      var y = padT + plotH - (v / maxV) * plotH;
      ctx.strokeStyle = '#eef1f6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      ctx.fillStyle = '#9aa6b6';
      ctx.fillText(String(v), padL - 8, y + 4);
    }

    var n = trend.labels.length;
    var xAt = function (i) { return padL + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1)); };
    var yAt = function (v) { return padT + plotH - (v / maxV) * plotH; };

    // X 轴标签
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9aa6b6';
    trend.labels.forEach(function (label, i) {
      ctx.fillText(label, xAt(i), padT + plotH + 18);
    });

    drawSeries(ctx, trend.labels.length, xAt, yAt, trend.avg, '#c0cbd9', false);
    drawSeries(ctx, trend.labels.length, xAt, yAt, trend.mine, '#2b7de9', true);
  }

  function drawSeries(ctx, n, xAt, yAt, data, color, showPoints) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach(function (v, i) {
      var x = xAt(i), y = yAt(v);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    if (showPoints) {
      data.forEach(function (v, i) {
        var x = xAt(i), y = yAt(v);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < 0) return;
    r = r || 0;
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + w - r.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
  }

  function shorten(s, max) { return s.length > max ? s.slice(0, max) + '…' : s; }

  /* ------------------------------------------------------------------
     窗口自适应重绘
     ------------------------------------------------------------------ */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (document.body.getAttribute('data-page') === 'grades') renderGrades();
    }, 200);
  });

  /* ------------------------------------------------------------------
     对外接口
     ------------------------------------------------------------------ */
  window.XLS = {
    initShell: initShell,
    renderHome: renderHome,
    renderHomework: renderHomework,
    renderExperiments: renderExperiments,
    renderGrades: renderGrades,
    viewHomework: viewHomework,
    viewExperiment: viewExperiment,
    toast: toast,
    getUsers: getUsers,
    saveUsers: saveUsers,
    currentUser: currentUser
  };
})();
