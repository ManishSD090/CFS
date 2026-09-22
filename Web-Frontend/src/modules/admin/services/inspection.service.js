let insData = [
  { id:1, date:'25 Sep 2025', prepared:'Ajay Singh', sent:'15 Oct 2026', viewed:'15 Oct 2026', status:'Pending',
    project:'Site A — Residential Block', location:'Mumbai | ID-2341', visitor:'Ajay Singh', weather:'Sunny',
    desc:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    progress:29.5, todayProgress:1.5,
    tasks:[{name:'Task Name',done:4,total:4,st:'Completed'},{name:'Task Name',done:4,total:4,st:'In Progress'},{name:'Task Name',done:4,total:4,st:'Pending'}],
    att:{label:'22/30',workers:'16/20',staff:'6/10',sub:'4 workers'},
    mats:[{name:'Name',qty:'Quantity Used'},{name:'Name',qty:'Quantity Used'}],
    equip:[{name:'Name'},{name:'Name'}],
    budget:{labour:120000,material:120000,equipment:120000,sub:120000,total:120000},
    issues:'', tasks2:['Name','Name'], notes:''
  },
  { id:2, date:'25 Sep 2025', prepared:'Ajay Singh', sent:'15 Oct 2026', viewed:'16 Oct 2026', status:'Approved',
    project:'Site A — Residential Block', location:'Mumbai | ID-2341', visitor:'Ajay Singh', weather:'Cloudy',
    desc:'Concrete pouring completed for columns C1 to C8 on the 3rd floor.',
    progress:35, todayProgress:2.0,
    tasks:[{name:'Task Name',done:4,total:4,st:'Completed'},{name:'Task Name',done:2,total:4,st:'In Progress'}],
    att:{label:'26/30',workers:'18/20',staff:'8/10',sub:'6 workers'},
    mats:[{name:'Cement',qty:'120 bags'},{name:'Steel',qty:'4 tons'}],
    equip:[{name:'Crane'},{name:'Mixer'}],
    budget:{labour:100000,material:150000,equipment:80000,sub:70000,total:400000},
    issues:'Minor delay on wing C.', tasks2:['Column pouring','Shuttering'], notes:'Next: slab casting.'
  },
  { id:3, date:'25 Sep 2025', prepared:'Ajay Singh', sent:'19 Oct 2026', viewed:'19 Oct 2026', status:'Approved',
    project:'Site A — Residential Block', location:'Mumbai | ID-2341', visitor:'Ajay Singh', weather:'Sunny',
    desc:'Brick masonry completed for outer wall on east wing.',
    progress:40, todayProgress:0.8,
    tasks:[{name:'Task Name',done:4,total:4,st:'Completed'}],
    att:{label:'19/30',workers:'14/20',staff:'5/10',sub:'2 workers'},
    mats:[{name:'Bricks',qty:'2000 pcs'}],
    equip:[{name:'Scaffolding'}],
    budget:{labour:90000,material:60000,equipment:20000,sub:30000,total:200000},
    issues:'', tasks2:['Masonry east wing'], notes:''
  },
];

export const inspectionService = {
  getInspections: async () => {
    return new Promise((resolve) => setTimeout(() => resolve([...insData]), 400));
  },
  
  updateInspectionStatus: async (id, status) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const itemIndex = insData.findIndex(x => x.id === id);
        if (itemIndex > -1) {
          insData[itemIndex] = { ...insData[itemIndex], status };
          resolve(insData[itemIndex]);
        } else {
          reject('Inspection not found');
        }
      }, 400);
    });
  }
};
