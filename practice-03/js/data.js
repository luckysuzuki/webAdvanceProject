/* ==========================================================================
   学习通 · 网页端界面复刻  —  模拟数据
   全部为静态演示数据，仅用于界面展示，无后端交互。
   ========================================================================== */

window.APP_DATA = {

  /* 当前登录用户（未登录时为默认演示用户） */
  user: { name: '张同学', role: '学生', code: '20230001', school: '某某大学' },

  /* 我的课程 */
  courses: [
    { id: 1, name: 'Web 前端开发', teacher: '王老师', cover: 'cover-1', progress: 72, chapters: 12, finished: 8 },
    { id: 2, name: '数据结构与算法', teacher: '李老师', cover: 'cover-2', progress: 45, chapters: 16, finished: 7 },
    { id: 3, name: '数据库原理', teacher: '赵老师', cover: 'cover-3', progress: 88, chapters: 10, finished: 9 },
    { id: 4, name: '计算机网络', teacher: '孙老师', cover: 'cover-4', progress: 30, chapters: 14, finished: 4 },
    { id: 5, name: '软件工程导论', teacher: '周老师', cover: 'cover-5', progress: 61, chapters: 8, finished: 5 },
    { id: 6, name: '操作系统', teacher: '吴老师', cover: 'cover-6', progress: 52, chapters: 12, finished: 6 }
  ],

  /* 通知公告 */
  notices: [
    { tag: 'blue', tagText: '作业', title: '《Web 前端开发》第 3 次作业已发布，请及时完成', date: '09-20' },
    { tag: 'green', tagText: '实验', title: '《数据结构》实验四：二叉树的遍历 已开放', date: '09-19' },
    { tag: 'red', tagText: '考试', title: '期中考试安排已公布，请提前复习备考', date: '09-18' },
    { tag: 'blue', tagText: '通知', title: '本周六系统维护，学习通将暂停服务 2 小时', date: '09-17' },
    { tag: 'green', tagText: '成绩', title: '《数据库原理》实验成绩已公布，快去查看吧', date: '09-16' }
  ],

  /* 作业 */
  homework: [
    { id: 101, name: 'HTML 语义化标签练习', course: 'Web 前端开发', deadline: '09-22 23:59', status: 'done', score: '92' },
    { id: 102, name: 'CSS 弹性布局实战', course: 'Web 前端开发', deadline: '09-25 23:59', status: 'todo', score: null },
    { id: 103, name: '二叉树的中序遍历实现', course: '数据结构与算法', deadline: '09-21 23:59', status: 'todo', score: null },
    { id: 104, name: 'SQL 多表连接查询', course: '数据库原理', deadline: '09-23 23:59', status: 'done', score: '88' },
    { id: 105, name: '三次握手与四次挥手分析', course: '计算机网络', deadline: '09-24 23:59', status: 'grading', score: null },
    { id: 106, name: '软件需求分析报告', course: '软件工程导论', deadline: '09-26 23:59', status: 'todo', score: null },
    { id: 107, name: '进程调度算法总结', course: '操作系统', deadline: '09-19 23:59', status: 'done', score: '95' }
  ],

  /* 实验 */
  experiments: [
    { id: 201, name: '实验一：HTML 页面结构搭建', course: 'Web 前端开发', deadline: '09-23 18:00', status: 'done', report: '已提交' },
    { id: 202, name: '实验二：CSS 响应式布局', course: 'Web 前端开发', deadline: '09-28 18:00', status: 'doing', report: '未提交' },
    { id: 203, name: '实验三：链表的创建与遍历', course: '数据结构与算法', deadline: '09-24 18:00', status: 'doing', report: '未提交' },
    { id: 204, name: '实验四：二叉树的遍历', course: '数据结构与算法', deadline: '09-30 18:00', status: 'todo', report: '未提交' },
    { id: 205, name: '实验五：数据库的增删改查', course: '数据库原理', deadline: '09-22 18:00', status: 'done', report: '已提交' },
    { id: 206, name: '实验六：Socket 网络编程', course: '计算机网络', deadline: '10-05 18:00', status: 'todo', report: '未提交' }
  ],

  /* 各科成绩（用于成绩统计表格与图表） */
  grades: [
    { course: 'Web 前端开发', usual: 90, lab: 92, final: 88, credit: 3.0 },
    { course: '数据结构与算法', usual: 85, lab: 88, final: 82, credit: 4.0 },
    { course: '数据库原理', usual: 88, lab: 90, final: 86, credit: 3.0 },
    { course: '计算机网络', usual: 80, lab: 84, final: 78, credit: 3.5 },
    { course: '软件工程导论', usual: 92, lab: 89, final: 90, credit: 2.5 },
    { course: '操作系统', usual: 78, lab: 82, final: 75, credit: 4.0 }
  ],

  /* 成绩趋势（历次测验分数，用于折线图） */
  trend: {
    labels: ['第1次', '第2次', '第3次', '第4次', '第5次', '第6次'],
    mine:   [72, 78, 74, 85, 82, 90],
    avg:    [68, 71, 70, 76, 77, 79]
  }
};
