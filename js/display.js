function displayTaxonsCard(taxonList) {
  var myContainer = document.getElementById("taxons-results");
  myContainer.innerHTML = "";
  // proper call to the function
  taxonList.forEach((el) => {
    addTaxon(el, myContainer);
  });
}

function addTaxon(arrayTaxon, refContainer) {
  // from an array of dicts describing taxons, populates "table_contenu" with cards describing each
  // get image from taxon
  let imgTaxon = arrayTaxon["mediaUrl"];

  // Create card element to be appened to card-group
  let cardCont = document.createElement("div");
  cardCont.className = "card col-3 cursor-pointer";

  let myCard = document.createElement("div");
  myCard.classList = "card-body text-center";

  let myCardFoot = document.createElement("div");

  // set title and text
  let cardTitle = document.createElement("h5");
  cardTitle.innerText = arrayTaxon["species"];
  cardTitle.className = "card-title";

  let myFigure = document.createElement("img");
  myFigure.id = arrayTaxon["species"];
  myFigure.src = arrayTaxon["mediaUrl"]
    ? arrayTaxon["mediaUrl"]
    : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
  myFigure.className = "card-img-top";

  let myStatus = document.createElement("small");
  let html_ = "";
  if (arrayTaxon.status) {
    Object.keys(arrayTaxon.status[0]).forEach((el) => {
      let color =
        arrayTaxon.status[0][el] in colorStatus
          ? colorStatus[arrayTaxon.status[0][el]]
          : "rgba(var(--bs-primary-rgb)";
      if (arrayTaxon.status[0][el] && config.STATUS_LABELS[el]) {
        html_ += `<span class="badge" style="background-color:${color}">${config.STATUS_LABELS[el]}: ${arrayTaxon.status[0][el]}</span> `;
      }
    });
  }
  myStatus.innerHTML = html_;
  myStatus.className = "text-muted";

  // Build elements
  myCardFoot.appendChild(myStatus);

  cardCont.appendChild(myFigure);
  myCard.appendChild(cardTitle);
  cardCont.appendChild(myCard);
  myCard.appendChild(myCardFoot);

  refContainer.appendChild(cardCont);
  return;
}

//https://nc.iucnredlist.org/redlist/resources/files/1646067752-FINAL_IUCN_Red_List_colour_chart.pdf
var colorStatus = {
  EX: "#000000",
  EW: "#3d1951",
  RE: "#5a1a63",
  CR: "#d3001b",
  EN: "#fbbf00",
  VU: "#ffed00",
  NT: "#fbf2ca",
  LC: "#78b74a",
  DD: "#d3d4d5",
  NA: "#919291",
  NE: "#ffffff",
};
