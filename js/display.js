
function displayTaxonsCard(taxonList) {
    var myContainer = document.getElementById("taxons-results");
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
    cardCont.className = "card col cursor-pointer";
    let myCard = document.createElement("div");
    myCard.classList = "card-body";

    let myCardFoot = document.createElement("div");
    myCardFoot.classList = "card-footer";

    // set title and text
    let cardTitle = document.createElement("h5");
    cardTitle.innerText = arrayTaxon["species"];
    cardTitle.className = "card-title";

    let myFigure = document.createElement("img");
    myFigure.id = arrayTaxon["species"];
    myFigure.src = arrayTaxon["mediaUrl"];
    myFigure.className = "card-img-top";

    let myStatus = document.createElement("small");
    myStatus.innerText = arrayTaxon["status"];
    myStatus.className = "text-muted";

    // Build elements
    myCardFoot.appendChild(myStatus);

    myCard.appendChild(myFigure);
    myCard.appendChild(cardTitle);
    cardCont.appendChild(myCard);
    cardCont.appendChild(myCardFoot);
    refContainer.appendChild(cardCont);
    return;
}


//https://nc.iucnredlist.org/redlist/resources/files/1646067752-FINAL_IUCN_Red_List_colour_chart.pdf
var colorStatus = {
    "Near threatened (NT)": "#CCE226",
    "Vulnerable (VU)": "#F9E814",
    "Endangered (EN)": "#FC7F3F",
    "Critically Endangered (CR)": "#D81E05",
};