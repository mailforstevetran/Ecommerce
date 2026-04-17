'use strict';

const LEVELS = [
  { waves: [
    [{ type:'walker', count:5 }],
    [{ type:'walker', count:8 }, { type:'runner', count:2 }],
  ]},
  { waves: [
    [{ type:'walker', count:6 }, { type:'runner', count:3 }],
    [{ type:'walker', count:5 }, { type:'runner', count:2 }, { type:'tank', count:1 }],
  ]},
  { waves: [
    [{ type:'walker', count:8 }, { type:'runner', count:4 }],
    [{ type:'runner', count:6 }, { type:'tank', count:1 }],
  ]},
  { waves: [
    [{ type:'walker', count:10 }, { type:'runner', count:5 }],
    [{ type:'runner', count:8 }, { type:'tank', count:2 }],
  ]},
  { waves: [
    [{ type:'runner', count:8 }, { type:'tank', count:2 }],
    [{ type:'walker', count:8 }, { type:'runner', count:6 }, { type:'tank', count:1 }],
  ]},
  { waves: [
    [{ type:'walker', count:12 }, { type:'runner', count:6 }, { type:'tank', count:2 }],
    [{ type:'runner', count:10 }, { type:'tank', count:3 }],
  ]},
  { waves: [
    [{ type:'runner', count:12 }, { type:'tank', count:3 }],
    [{ type:'walker', count:10 }, { type:'runner', count:8 }, { type:'tank', count:2 }],
  ]},
  { waves: [
    [{ type:'runner', count:15 }, { type:'tank', count:4 }],
    [{ type:'walker', count:12 }, { type:'runner', count:10 }, { type:'tank', count:3 }],
  ]},
  { waves: [
    [{ type:'runner', count:18 }, { type:'tank', count:5 }],
    [{ type:'runner', count:15 }, { type:'tank', count:6 }],
  ]},
  { waves: [
    [{ type:'walker', count:15 }, { type:'runner', count:15 }, { type:'tank', count:5 }],
    [{ type:'runner', count:20 }, { type:'tank', count:8 }],
  ]},
];
