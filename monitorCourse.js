const request = require('request');
const cron = require('cron');
const cheerio = require('cheerio');

// consts
const ENRL_TOT = 'Enrl Tot';
const ENRL_CAP = 'Enrl Cap';
const CLASS = 'Class';
const COMP_SEC = 'Comp Sec';

const runOnInit = true;

const createURL = (subject, catalogNumber, term) => {
  const level = (catalogNumber.length < 3 || (catalogNumber.charAt(0) <= 4)) ? 'under' : 'grad';
  subject = subject.toUpperCase();
  catalogNumber = catalogNumber.toUpperCase();
  return `http://www.adm.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=${level}&sess=${term}&subject=${subject}&cournum=${catalogNumber}`;
}

const parseArgs = () => {
  const argsLen = process.argv.length;
  let facultyCode = "CS", courseCode = "251", termCode = "1191";

  switch (argsLen) {
    case 2:
      console.log(`using defaults ${facultyCode} ${courseCode} ${termCode}`);
      break;
    case 4:
      courseCode = process.argv[ 2 ].slice(-4);
      if (isNaN(parseInt(courseCode))) { courseCode = process.argv[ 2 ].slice(-3); }
      facultyCode = process.argv[ 2 ].replace(courseCode, '');
      termCode = process.argv[ 3 ];
      break;
    case 5:
      facultyCode = process.argv[ 2 ];
      courseCode = process.argv[ 3 ];
      termCode = process.argv[ 4 ];
      break;
  }

  return [ facultyCode, courseCode, termCode ];
}

const getHTML = async url => {
  return new Promise((resolve, reject) => {
    request.get(url, function (err, _, html) {
      if (err) {
        console.error(`FAILED: ${url}. Err: ${err.message}`);
        reject(err);
      }
      else resolve(html);
    });
  });
}

const getHeaderKeys = headers => {
  try {
    let headerKeys = {};

    headers.each((idx, h) => {
      const label = h.children[ 0 ].children[ 0 ].data;

      switch (label) {
        case ENRL_CAP:
          headerKeys.capIdx = idx;
          break;
        case ENRL_TOT:
          headerKeys.totIdx = idx;
          break;
        case CLASS:
          headerKeys.classNumIdx = idx;
          break;
        case COMP_SEC:
          headerKeys.compSecIdx = idx;
          break;
      }
      // Lists all columns & index, useful for debugging/adding more keys
      // console.log(`idx ${idx}: ${label}`);
    });

    return headerKeys;
  }
  catch (err) {
    throw Error(`Couldn't parse: ${h}. Err: ${err.message}`);
  }
}

const parseClassHTML = async (classHTML, cb) => {
  try {
    const $ = cheerio.load(classHTML);
    const headers = $("TABLE").eq(1).find('TH');
    const numCols = headers.length;
    const content = $("TABLE").eq(1).find('TD');

    const { totIdx, capIdx, classNumIdx, compSecIdx } = getHeaderKeys(headers);

    const capKeys = generateKeys(capIdx, content.length, numCols);
    const totKeys = generateKeys(totIdx, content.length, numCols);

    const mapKeysToContentData = mapKeysToData(content);

    // For debugging(eg. to see if callback gets fired)
    // const totContentData = capKeys.map(mapKeysToContentData);
    // const capContentData = totKeys.map(mapKeysToContentData);

    const capContentData = capKeys.map(mapKeysToContentData);
    const totContentData = totKeys.map(mapKeysToContentData);

    if (capContentData.length !== totContentData.length) {
      throw Error("There was an error parsing the content table");
    }

    let foundOpening = false;

    totContentData.forEach((total, row) => {
      if (foundOpening) { return; }
      const cap = capContentData[ row ];
      console.log(`${total}/${cap}`);
      if (total < cap) {

        const compSecKey = compSecIdx + row * numCols;
        const compSecData = content[ compSecKey ].children[ 0 ].data.replace(/\s$/, '');

        foundOpening = isLec(compSecData);
        if (foundOpening) {
          const classKey = classNumIdx + row * numCols;
          const classData = parseInt(content[ classKey ].children[ 0 ].data);

          console.log(`There's an opening for class: ${classData} ${compSecData}!`);
          cb && cb();
        }
      }
    });

    (!foundOpening) && console.log("No openings found. Please check again in 30 minutes");
  }
  catch (err) {
    console.error(err);
  }
}

const isLec = compSec => compSec.includes("LEC");
const mapKeysToData = content => key => parseInt(content[ key ].children[ 0 ].data);

const generateKeys = (firstKey, maxIndex, modulus) => {
  const length = maxIndex / modulus;
  return Array.from({ length }, (_, idx) => firstKey + idx * modulus);
}

const monitorCourse = async () => {
  const url = createURL(...parseArgs());
  console.log(url);
  const classHTML = await getHTML(url);

  parseClassHTML(classHTML, () => {
    console.log(`Double-check here ${url}`);
    job.stop();
  });
}


const job = new cron.CronJob('* */30 * * * *', function() {
  // console.log('URL: ', url);
  monitorCourse();
}, null, true, 'America/Los_Angeles', null, runOnInit);

job.start();
