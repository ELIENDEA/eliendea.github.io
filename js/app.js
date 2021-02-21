//initialiser le marqueur de la case cliquée
window.idCase = -1

const MIN_SIMILAR_CASE_TO_BOMBE = 3
const CANDY_IMAGES = ["Blue.png","Green.png","Orange.png","Red.png","Yellow.png"]

async function runGameLogic(e){

  console.log("event",e.target.parentNode.id);
  if (window.idCase >-1) { // 2eme click
    // Selectionner une case selectionnable pour continuer le jeu
    if (window.idSelectableCase.indexOf(parseInt(e.target.parentNode.id)) > -1) { // position de l'element
        var imagePermute = document.getElementById(window.idCase).firstChild
        //permute images
        if (e.target.src !== imagePermute.src) {
          console.log("permute");

          var image = e.target.src
          e.target.src = imagePermute.src
          imagePermute.src = image
          imagePermute.classList.remove("selection")

          window.similarityCase1 = JSON.parse(JSON.stringify({}))
          window.similarityCase2 = JSON.parse(JSON.stringify({}))

          window.similarityCase1 = await searchGroupCaseVH(window.idCase)
          window.similarityCase2 = await searchGroupCaseVH(e.target.parentNode.id)

          bombingCase()

        }

    }
    e.target.parentNode.classList.remove("selection")
    document.getElementById(window.idCase).classList.remove("selection")
    window.idCase = -1
  console.log("2mem clique",window.idCase);

  } else { // 1 er click
    console.log("1 er clique");
    window.idCase = e.target.parentNode.id
    e.target.parentNode.classList.add("selection")
    getSelectableNeighbors(window.idCase)
  }
}
function getSelectableNeighbors(idCase) {
    idCase = parseInt(idCase)
    console.log("getSelectableNeighbors",idCase);
    // Deux selections possibles
    if (idCase == 0) { // Case coin haut gauche
      console.log("cases "+idCase +":",idCase+1, idCase+10);
      window.idSelectableCase = [idCase+1, idCase+10]
    }else if (idCase == 9) { // Case coin haut droit
      console.log("cases "+idCase +":",idCase-1, idCase+10);
      window.idSelectableCase =[idCase-1, idCase+10]
    }else if (idCase == 90) { // Case coin bas gauche
      console.log("cases "+idCase +":",idCase+1, idCase-10);
      window.idSelectableCase =[idCase+1, idCase-10]
    }else if (idCase == 99) { // Case coin bas droit
      console.log("cases "+idCase +":",idCase-1, idCase-10);
      window.idSelectableCase =[idCase-1, idCase-10]
    }
    // Trois selections possible
    // Toutes les cases de la ligne 1
    else if (idCase > 0 && idCase < 9) {
      console.log("cases "+idCase +":",idCase+1, idCase-1, idCase+10);
      window.idSelectableCase =[idCase+1, idCase-1, idCase+10]

    }
    // Toutes les cases de colonne 1
    else if (idCase % 10 == 0) {
      console.log("cases "+idCase +":",idCase-10, idCase+1, idCase+10);
      window.idSelectableCase =[idCase-10, idCase+1, idCase+10]
    }
    // Toutes les cases de la derniere ligne
    else if (idCase > 90 && idCase < 99) {
      console.log("cases "+idCase +":",idCase-1, idCase-10, idCase+1);
      window.idSelectableCase =[idCase-1, idCase-10, idCase+1]

    }
    // Toutes les cases de la derniere colonne
    else if (idCase % 10 == 9) {
      console.log("cases "+idCase +":",idCase-10, idCase-1, idCase+10);
      window.idSelectableCase =[idCase-10, idCase-1, idCase+10]

    }
    // Toutes les autres cases
    else {
      console.log("cases "+idCase +":",idCase-1, idCase+1, idCase-10, idCase+10);
      window.idSelectableCase =[idCase-1, idCase+1, idCase-10, idCase+10]
    }
}

function downUpCases(idCase){
  idCase = parseInt(idCase)

  return new Promise(async function(resolve){
    var currentIdCase = idCase;
    var baseCase = document.getElementById(idCase).firstChild
    var upCases = [idCase]

    while(currentIdCase >= 0){
      if(!document.getElementById(currentIdCase).firstChild.src.includes("/bombing.png")){
        upCases.push(currentIdCase);
      }
      currentIdCase-=10
    }
    // while (currentIdCase >= 0) {
    //   await new Promise(resolve => setTimeout(resolve, 500));
    // }
    upCases.sort(function(a, b){return parseInt(b) - parseInt(a)});
    console.log("After Sort upCases", upCases)
    for (var i = 0; i < upCases.length -1; i++) {
      document.getElementById(upCases[i]).firstChild.src =
      document.getElementById(upCases[i+1]).firstChild.src
      document.getElementById(upCases[i+1]).firstChild.src= "images/bombing.png";
    }

    resolve();
  })
}

async function generateGapCase(){
  var cases = document.querySelectorAll(".candycase")
  var gapCase = JSON.parse(JSON.stringify([]))
  // do {
    // console.log("cases", cases)
    for (var i = 0; i < cases.length; i++) {
      if(cases[i].firstChild.src.includes("/bombing.png")){
        gapCase.push(cases[i].id);
      }
    }

    gapCase.sort(function(a, b){return parseInt(b) - parseInt(a)});
    console.log("gapCase", gapCase)

    // fais descendre les cases
    for (var i = gapCase.length - 1; i >= 0; i--) {
      await downUpCases(gapCase[i])
    }

    // rerengere les cases
    for (var i = 0; i < cases.length; i++) {
      if(cases[i].firstChild.src.includes("/bombing.png")){
        const randomElement = CANDY_IMAGES[Math.floor(Math.random() * CANDY_IMAGES.length)];
        cases[i].firstChild.src = "images/"+randomElement
      }
    }
}


function bombingCase(){
  // var keysCase =  Object.keys(window.similarityCase1);
  var keysCase = [ "horizontal_middle", "vertical_middle", "right", "left", "top", "bottom"]
  var CaseToCheck = ["similarityCase1", "similarityCase2"]

  for (var c = 0; c < CaseToCheck.length; c++) {
    for (var i = 0; i < keysCase.length; i++) {
      if(window[CaseToCheck[c]][keysCase[i]].length >= MIN_SIMILAR_CASE_TO_BOMBE){
        for (var j = 0; j < window[CaseToCheck[c]][keysCase[i]].length; j++) {
          document.getElementById(window[CaseToCheck[c]][keysCase[i]][j]).firstChild.src ="/images/bombing.png"
        }
      }
    }
  }
  generateGapCase()
}




async function cloneCase() {
  while (document.querySelector(".candycase") == null) {
      await new Promise(resolve => setTimeout(resolve, 500));
  }
  var cas = document.querySelector(".candycase");
  var plateau = document.querySelector(".plateau");
  cas.addEventListener("click", function(e) {
    runGameLogic(e)
    // window.idCase = e.target.parentNode.id
    // console.log("event",window.idCase)
    // cas.style.background ="lightgray"
    getSelectableNeighbors(window.idCase)

  });

  for (var i = 0; i < 99; i++) {
    const randomElement = CANDY_IMAGES[Math.floor(Math.random() * CANDY_IMAGES.length)];
    var clone = cas.cloneNode(true)
    clone.id = i+1
    var img = clone.querySelector("img").src ="images/"+randomElement
    plateau.appendChild(clone);
    clone.addEventListener("click", function(e) { runGameLogic(e)
    });


  }

}
async function searchGroupCaseVH(idCase) {
  return new Promise(resolve =>{
    idCase = parseInt(idCase);
    var image = document.getElementById(idCase).firstChild
    var currentIdCase = idCase
    var similaryCases = JSON.parse(JSON.stringify({
      right : [],
      left : [],
      top : [],
      bottom : [],
      horizontal_middle:[],
      vertical_middle:[]
    }))
    /// verification Left
    while(currentIdCase % 10 >= 0) {
      var Currentimage = document.getElementById(currentIdCase).firstChild
      if(Currentimage.src == image.src){
        similaryCases.left.push(currentIdCase)
        if(similaryCases.horizontal_middle.indexOf(currentIdCase) === -1){
          similaryCases.horizontal_middle.push(currentIdCase)
        }
        currentIdCase--
      }
      else break;
    }
    if(similaryCases.horizontal_middle.indexOf(idCase) === -1){
      similaryCases.horizontal_middle.push(idCase)
    }
    /// verification Right
    currentIdCase = idCase
    while(currentIdCase % 10 <= 9) {
      var Currentimage = document.getElementById(currentIdCase).firstChild
      if(Currentimage.src == image.src){
        similaryCases.right.push(currentIdCase)
        if(similaryCases.horizontal_middle.indexOf(currentIdCase) === -1){
          similaryCases.horizontal_middle.push(currentIdCase)
        }
        currentIdCase++
      }
      else break;
    }

    /// verification Top
    currentIdCase = idCase
    while(currentIdCase > 0) {
      var Currentimage = document.getElementById(currentIdCase).firstChild
      if(Currentimage.src == image.src){
        similaryCases.top.push(currentIdCase)
        if(similaryCases.vertical_middle.indexOf(currentIdCase) === -1){
          similaryCases.vertical_middle.push(currentIdCase)
        }
        currentIdCase-=10
      }
      else break;
    }
    if(similaryCases.vertical_middle.indexOf(idCase) === -1){
      similaryCases.vertical_middle.push(idCase)
    }
    /// verification Bottom
    currentIdCase = idCase
    while(currentIdCase <  100) {
      var Currentimage = document.getElementById(currentIdCase).firstChild
      if(Currentimage.src == image.src){
        similaryCases.bottom.push(currentIdCase)
        if(similaryCases.vertical_middle.indexOf(currentIdCase) === -1){
          similaryCases.vertical_middle.push(currentIdCase)
        }
        currentIdCase+=10
      }
      else break;
    }

    console.log('similaryCases', similaryCases)
    resolve(similaryCases);
  })
}



cloneCase()
