/* STARDOM · engine/world.js — static world data (Bible) */
(function(){
  // tz = fixed UTC offset in hours (no daylight saving). density = PH 1–5.
  const CITIES = [
    ["new-york","New York","USA",-5,40.71,-74.01,5],
    ["los-angeles","Los Angeles","USA",-8,34.05,-118.24,4],
    ["mexico-city","Mexico City","Mexico",-6,19.43,-99.13,5],
    ["toronto","Toronto","Canada",-5,43.65,-79.38,3],
    ["chicago","Chicago","USA",-6,41.88,-87.63,3],
    ["sao-paulo","São Paulo","Brazil",-3,-23.55,-46.63,5],
    ["rio","Rio de Janeiro","Brazil",-3,-22.91,-43.17,4],
    ["buenos-aires","Buenos Aires","Argentina",-3,-34.60,-58.38,4],
    ["santiago","Santiago","Chile",-4,-33.45,-70.67,3],
    ["london","London","UK",0,51.51,-0.13,5],
    ["paris","Paris","France",1,48.86,2.35,4],
    ["berlin","Berlin","Germany",1,52.52,13.40,3],
    ["madrid","Madrid","Spain",1,40.42,-3.70,3],
    ["amsterdam","Amsterdam","Netherlands",1,52.37,4.90,2],
    ["tokyo","Tokyo","Japan",9,35.68,139.69,5],
    ["seoul","Seoul","South Korea",9,37.57,126.98,5],
    ["manila","Manila","Philippines",8,14.60,120.98,4],
    ["singapore","Singapore","Singapore",8,1.35,103.82,3],
    ["sydney","Sydney","Australia",10,-33.87,151.21,3],
    ["johannesburg","Johannesburg","South Africa",2,-26.20,28.05,3],
    ["shanghai","Shanghai","China",8,31.23,121.47,5]
  ].map(([id,name,country,tz,lat,lon,density])=>({id,name,country,tz,lat,lon,density}));

  const LOCATION_TYPES = [
    ["studio","Recording studio","disc"],["tv","TV studio","tv"],["airport","Airport","plane"],
    ["club","Club","wave"],["arena","Arena","users"],["stadium","Stadium","star"]
  ];

  const LEVELS = ["Absolute Zero","Terrible","Poor","Incompetent","Inexperienced","Beginner","Amateur","Mediocre","Acceptable","Competent","Skilled","Experienced","Advanced","Specialist","Notable","Formidable","Exceptional","Virtuoso","Genius","Masterful","Legendary","Transcendent","Unshakable","Sovereign","Unsurpassable","Divine"];

  const ATTRIBUTES = ["Visual","Charisma","Talent","Persuasion"];
  const GENRES = ["Pop","Rock","R&B","Electronic","Rap/Hip Hop","K-pop","Latin","Alternative","Country","Metal"];
  const SKILL_BLOCKS = [
    { block:"Media & Social", skills:["Etiquette","Rhetoric","Oratory","Media Training"] },
    { block:"Music", skills:["Music Production","Cinematography","Melody Composition","Basic Lyrics","Stage Presence","Musical Improvisation", ...GENRES.map(g=>g+" (genre)")] },
    { block:"Instruments", skills:["Piano","Guitar","Acoustic Guitar","Lead Vocals","Rapper","Drums","Dancer","DJ"] }
  ];
  const DENSITY = ["","Very low","Low","Medium","High","Very high"]; // PH labels

  const city = id => CITIES.find(c=>c.id===id);
  function distanceKm(a,b){
    const R=6371, r=x=>x*Math.PI/180, A=city(a), B=city(b);
    const dLat=r(B.lat-A.lat), dLon=r(B.lon-A.lon);
    const h=Math.sin(dLat/2)**2+Math.cos(r(A.lat))*Math.cos(r(B.lat))*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(h));
  }
  function travelMinutes(a,b){
    const C=STARDOM.config; if(a===b) return 0;
    const k=Math.min(1, distanceKm(a,b)/C.travelMaxDistanceKm);
    return Math.round((C.travelMinMinutes + k*(C.travelMaxMinutes-C.travelMinMinutes))/5)*5;
  }
  const locations = id => LOCATION_TYPES.map(([t,label,icon])=>({ id:id+":"+t, type:t, label, icon, name:`${city(id).name} ${label}` }));

  STARDOM.world = { CITIES, LOCATION_TYPES, LEVELS, ATTRIBUTES, GENRES, SKILL_BLOCKS, DENSITY, city, distanceKm, travelMinutes, locations };
})();
