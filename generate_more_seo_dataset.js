import fs from 'fs';

// More SEO Classification Data - 9 Categories
const moreSeoData = {
  "Web 2.0 Submission": [
    "https://wordpress.com/",
    "https://www.blogger.com/",
    "https://evernote.com/",
    "https://www.weebly.com/in",
    "https://www.yola.com/",
    "https://sites.google.com/",
    "https://www.strikingly.com/",
    "https://medium.com/",
    "http://www.wikidot.com/",
    "https://www.livejournal.com/",
    "https://www.tumblr.com/",
    "https://www.scoop.it/",
    "https://anotepad.com/",
    "https://pbase.com/",
    "https://controlc.com/",
    "https://www.website.com/",
    "https://www.wix.com/",
    "https://site123.com/",
    "https://www.instapaper.com/",
    "https://www.notion.so/",
    "https://slashdot.org/",
    "https://squarespaceblog.com/",
    "https://www.deviantart.com/",
    "https://us.webnode.com/",
    "https://pastelink.net/",
    "https://youslade.com/",
    "https://afriprime.net/",
    "https://www.bib.az/",
    "https://lyfepal.com/",
    "https://vblogetin.com/",
    "https://win-blog.com/",
    "https://dailyblogzz.com/",
    "https://newsbloger.com/",
    "https://clickup.com/",
    "https://www.zoho.com/sites/",
    "https://www.typepad.com/",
    "https://hashnode.com/",
    "https://techplanet.today/",
    "https://www.mymeetbook.com/welcome",
    "https://ekonty.com/",
    "https://edublogs.org/",
    "https://blogpixi.com/",
    "https://onepage.website/",
    "https://postheaven.net",
    "https://www.kekogram.com",
    "https://community.wongcw.com",
    "https://www.campusacada.com",
    "https://blog2freedom.com/",
    "https://bloggip.com/",
    "https://qodsblog.com/",
    "https://liberty-blog.com/",
    "https://blogpayz.com/",
    "https://techionblog.com/",
    "https://buyoutblog.com/",
    "https://blogitright.com/",
    "https://blogunok.com/",
    "https://blog-eye.com/",
    "https://writeablog.net",
    "https://activoblog.com/",
    "https://blogoxo.com/",
    "https://suomiblog.com/",
    "https://pointblog.net/",
    "https://full-design.com/",
    "https://thezenweb.com/",
    "https://tinyblogging.com/",
    "https://affiliatblogger.com/",
    "https://fitnell.com/",
    "https://blog5.net/",
    "https://dbblog.net/",
    "https://diowebhost.com/",
    "https://designertoblog.com/",
    "https://ezblogz.com/",
    "https://bluxeblog.com/",
    "https://mpeblog.com/",
    "https://blogs-service.com/",
    "https://articlesblogger.com/",
    "https://arwebo.com/",
    "https://blogerus.com/",
    "https://bloggin-ads.com/",
    "https://blogpostie.com/",
    "https://blogdigy.com/",
    "https://mybjjblog.com/",
    "https://tblogz.com/",
    "https://uzblog.net/",
    "https://www.websitebuilder.com/",
    "https://8b.com/",
    "https://webflow.com/",
    "https://www.simplesite.com/",
    "https://www.imcreator.com/",
    "https://www.mozello.com/",
    "https://www.squarespace.com/",
    "https://tablo.io/",
    "https://www.bigcartel.com/",
    "https://blogfreely.net/",
    "https://write.as/",
    "https://www.cabanova.com/p/en/",
    "https://www.jimdo.com/",
    "https://myspace.com/",
    "http://snappages.com/",
    "https://www.own-free-website.com/",
    "https://www.xing.com/",
    "https://www.webstarts.com/",
    "https://blog.fc2.com/",
    "https://www.en.sitew.com/",
    "https://www.emyspot.com/",
    "https://angelfire.lycos.com/",
    "https://www.travelblog.org/"
  ],
  "Q & A Websites": [
    "https://www.quora.com",
    "https://www.girlsaskguys.com/",
    "http://m.rediff.com/qna",
    "https://ask.metafilter.com/",
    "http://answerbag.com/",
    "https://stackoverflow.com",
    "https://www.theanswerbank.co.uk",
    "https://www.blurtit.com",
    "https://www.askmehelpdesk.com",
    "https://www.answers.com",
    "https://superuser.com",
    "https://www.answerclub.org/",
    "https://www.getupgenie.com/",
    "https://www.oureducation.in/answers/",
    "https://emseyi.com/",
    "https://www.taksim.in/",
    "http://sorucevap.netyuvam.com/",
    "https://www.question-ksa.com/",
    "https://qna.lrmer.com/",
    "https://www.letsdiskuss.com/"
  ],
  "PDF Submission": [
    "https://www.scribd.com/?lohp=2",
    "https://issuu.com",
    "https://www.edocr.com",
    "https://en.calameo.com",
    "https://www.mediafire.com",
    "https://www.4shared.com",
    "https://www.free-ebooks.net",
    "https://tiiny.host/pdf-upload/",
    "https://upload-pdf.pdffiller.com/",
    "https://www.docdroid.net/",
    "https://pubhtml5.com/",
    "https://www.slideserve.com/"
  ],
  "PPT Submission": [
    "https://www.slideshare.net",
    "https://www.slideserve.com/",
    "https://www.powershow.com/",
    "https://slideplayer.com/",
    "https://issuu.com/",
    "https://www.4shared.com/",
    "https://www.edocr.com/",
    "https://pubhtml5.com/",
    "https://www.slideserve.com/"
  ],
  "Video Submission": [
    "https://www.youtube.com/",
    "https://vimeo.com/",
    "https://www.dailymotion.com/in",
    "https://www.teachertube.com/",
    "https://funnyjunk.com/"
  ],
  "Event Submission": [
    "https://www.whatshot.in/",
    "https://www.eventsgram.in/",
    "https://allevents.in/",
    "https://www.indiaeve.com/",
    "https://www.meraevents.com/",
    "https://www.eventfinda.co.nz/",
    "https://www.clubfreetime.com/",
    "https://myevent.com/",
    "https://www.meetup.com/",
    "https://www.youreventfree.com/",
    "https://www.eventbrite.com/",
    "https://insider.in/online",
    "https://10times.com/",
    "https://www.eventsnearhere.com/",
    "https://www.last.fm/events",
    "https://www.townscript.com/in/delhi",
    "https://eventsget.com/",
    "https://www.dineout.co.in/",
    "https://evvnt.com/",
    "https://www.delhievents.com/",
    "https://www.tickettailor.com/",
    "https://www.classmates.com/",
    "https://10times.com",
    "https://www.eventbrite.com",
    "https://gighub.club/"
  ],
  "Podcast Submission": [
    "https://soundcloud.com",
    "https://www.podbean.com",
    "https://earshot.in",
    "https://hubhopper.com",
    "https://tunein.com",
    "https://www.spreaker.com",
    "https://www.ivoox.com",
    "https://audioboom.com",
    "https://blubrry.com",
    "https://player.fm",
    "https://libsyn.com",
    "https://womeninpodcasting.com",
    "https://ukpodcasters.com",
    "https://fyyd.de",
    "http://www.gigadial.net/public/",
    "https://www.listennotes.com",
    "https://www.learnoutloud.com/Podcast-Directory",
    "https://www.pocketcasts.com/submit",
    "https://africanpodcasts.com",
    "https://ozpodcasts.com.au",
    "https://scifidinerpodcast.com",
    "https://castbox.fm/",
    "https://www.spreaker.com/",
    "https://libsyn.com/",
    "https://www.podcast.co/",
    "https://www.buzzsprout.com/",
    "https://www.listennotes.com/submit/",
    "https://pocketcasts.com/submit/",
    "https://ozpodcasts.com.au/submit/",
    "https://africanpodcasts.com/submit-a-podcast/",
    "https://anchor.fm/",
    "https://www.podigee.com/en/",
    "https://podcastpage.io/",
    "https://soundbran.ch/",
    "https://www.podomatic.com/"
  ],
  "Photo Sharing": [
    "https://www.instagram.com",
    "https://in.pinterest.com",
    "https://postimages.org/",
    "http://www.ipernity.com/",
    "http://imageshack.us",
    "https://www.flickr.com",
    "https://www.deviantart.com",
    "https://www.pbase.com",
    "https://imgur.com",
    "http://imageshack.com",
    "https://www.slickpic.com",
    "https://imageevent.com",
    "https://500px.com/",
    "https://photobucket.com",
    "http://www.imagevenue.com",
    "http://23hq.com",
    "https://www.fotki.com",
    "http://www.freeimagehosting.net",
    "https://postimages.org",
    "https://myphoto.eu",
    "https://weheartit.com"
  ],
  "Search Engine Submission": [
    "https://search.google.com/search-console",
    "https://www.bing.com/webmasters/about",
    "https://webmaster.yandex.com/site/indexing/reindex",
    "https://www.freewebsubmission.com/",
    "https://www.exactseek.com/",
    "https://viesearch.com/submit",
    "http://www.socialsubmissionengine.com/",
    "http://www.hotvsnot.com/Add-Site/Add-Site.aspx",
    "https://www.similarsitesearch.com/",
    "https://www.anoox.com/",
    "https://www.sonicrun.com/freelisting.html",
    "https://www.entireweb.com/free_submission/",
    "http://www.secretsearchenginelabs.com/add-url.php",
    "https://www.activesearchresults.com/",
    "https://somuch.com/submit-links/",
    "http://www.whatuseek.com/addurl.shtml",
    "https://www.sitepromotiondirectory.com/",
    "http://www.finest4.com/submit.php",
    "https://www.linkcentre.com/",
    "https://www.submissionmonster.com/",
    "https://www.jayde.com/submit.html",
    "https://www.hitwebdirectory.com/submit.php",
    "http://www.amidalla.de/add.htm",
    "https://www.sitesondisplay.com/"
  ],
  "Infographics Submission": [
    "https://www.shithot.co.uk/",
    "http://www.onlyinfographic.com/",
    "https://lkrllc.com/",
    "https://www.infographicszone.com/",
    "https://infographicplaza.com/",
    "https://coolinfographics.com/",
    "https://www.infographicbee.com/",
    "https://www.infographiclove.com/",
    "https://infographicexpo.com/",
    "https://elearninginfographics.com/",
    "https://infographicjournal.com/",
    "https://infographicsmania.com/",
    "https://ilovecharts.tumblr.com/submit",
    "https://www.best-infographics.com/",
    "http://www.infographicsubmission.com/",
    "https://medicalinfographics.wordpress.com/",
    "https://datavisualization.ch/",
    "https://www.cooldailyinfographics.com/",
    "https://www.easel.ly/",
    "https://datavisualizations.tumblr.com/",
    "https://www.dailyinfographic.com/",
    "https://www.loveinfographics.com/",
    "https://www.infographicportal.com/",
    "http://www.infographicpost.com/",
    "https://infographicsite.com/",
    "https://www.infographicsarchive.com/",
    "https://www.infographicsposters.com/"
  ],
  "RSS Submission": [
    "http://www.realtyfeedsearch.com",
    "http://www.readablog.com",
    "https://feedshark.brainbliss.com",
    "http://www.blogflux.com",
    "http://www.wingee.com",
    "https://www.rss-verzeichnis.de",
    "https://rssorange.com",
    "http://www.rss-network.com",
    "https://www.r-bloggers.com",
    "http://www.rss-network.com/submitrss.php",
    "http://www.rss-specifications.com/rss-submission.htm",
    "https://www.plazoo.com"
  ],
  "Ping Websites": [
    "http://www.pingoat.com/",
    "https://feedburner.google.com",
    "https://www.masspinger.org",
    "http://www.mypagerank.net",
    "http://pingomatic.com",
    "http://www.pingfarm.com",
    "https://feedshark.brainbliss.com",
    "http://www.blo.gs/ping.php",
    "http://www.indexkings.com/index.php",
    "https://ping.twingly.com",
    "https://www.ping.in",
    "https://www.pingmylinks.com"
  ],
  "Blog Commenting": [
    "http://www.morganskinner.com/",
    "http://www.laughloveandcraft.com/",
    "https://www.sfdcstuff.com/",
    "http://blog.chrisgorgolewski.org/",
    "http://www.keepitsimpleandfast.com/",
    "https://www.programminginterviews.info/",
    "https://www.minetechtips.com/",
    "http://www.juliannguerra.com/",
    "http://www.goneseoulsearching.com/",
    "http://www.madtv.me.uk",
    "http://blog.dyscalculia.org",
    "https://www.ourexternalworld.com",
    "http://www.myskinnyjeansdreams.com",
    "http://www.lenaroy.com",
    "http://www.cinematicparadox.com",
    "http://www.theworldinmykitchen.com",
    "http://www.thebenderbunch.com",
    "https://www.thefoodalphabet.com",
    "http://blog.jcow.net",
    "http://www.bailiandi.com/",
    "http://www.rainfrances.com/",
    "http://www.ancalima.ru/",
    "https://www.crystalcandymakeup.com/",
    "http://www.wallstreetrant.com/",
    "http://www.practicalsqldba.com/"
  ]
};

// Generate dataset
const directories = [];

Object.entries(moreSeoData).forEach(([category, urls]) => {
  urls.forEach((url, index) => {
    // Extract domain name for the directory name
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    const name = domain.split('.')[0];
    
    // Assign priority based on platform type and popularity
    let priority = 50; // Default priority
    
    // High priority platforms (major platforms)
    if (domain.includes('wordpress') || domain.includes('blogger') || domain.includes('medium') || 
        domain.includes('quora') || domain.includes('stackoverflow') || domain.includes('youtube') ||
        domain.includes('instagram') || domain.includes('pinterest') || domain.includes('flickr') ||
        domain.includes('slideshare') || domain.includes('scribd') || domain.includes('soundcloud') ||
        domain.includes('eventbrite') || domain.includes('meetup') || domain.includes('google')) {
      priority = 95;
    }
    // Medium-high priority (established platforms)
    else if (domain.includes('tumblr') || domain.includes('wix') || domain.includes('squarespace') ||
             domain.includes('vimeo') || domain.includes('dailymotion') || domain.includes('issuu') ||
             domain.includes('podbean') || domain.includes('libsyn') || domain.includes('deviantart') ||
             domain.includes('500px') || domain.includes('bing') || domain.includes('yandex')) {
      priority = 80;
    }
    // Medium priority (good platforms)
    else if (domain.includes('blog') || domain.includes('site') || domain.includes('web') ||
             domain.includes('event') || domain.includes('podcast') || domain.includes('photo') ||
             domain.includes('search') || domain.includes('infographic') || domain.includes('rss') ||
             domain.includes('ping') || domain.includes('comment')) {
      priority = 65;
    }
    // Lower priority (smaller platforms)
    else {
      priority = 45;
    }
    
    directories.push({
      classification: "More SEO",
      name: `${name.charAt(0).toUpperCase() + name.slice(1)} ${category} ${index + 1}`,
      url: url,
      category: category,
      priority: priority,
      description: `${category} platform for SEO and content marketing`,
      domain: domain,
      submissionUrl: url,
      isCustom: false,
      pageRank: Math.floor(Math.random() * 6) + 1,
      daScore: Math.floor(Math.random() * 50) + 25,
      spamScore: Math.floor(Math.random() * 4),
      status: "active",
      isPremium: priority >= 80,
      requiresApproval: true,
      totalSubmissions: 0,
      successfulSubmissions: 0,
      rejectionRate: 0,
      freeUserLimit: 0,
      starterUserLimit: 2,
      proUserLimit: 8,
      businessUserLimit: 20,
      enterpriseUserLimit: -1
    });
  });
});

// Save to JSON file
const jsonContent = directories.map(dir => 
  JSON.stringify(dir)
).join('\n');

fs.writeFileSync('more_seo_classification.json', jsonContent);

console.log(`✅ Generated ${directories.length} More SEO entries`);
console.log(`📁 Saved to: more_seo_classification.json`);

// Show category breakdown
Object.entries(moreSeoData).forEach(([category, urls]) => {
  const categoryDirectories = directories.filter(d => d.category === category);
  const highPriority = categoryDirectories.filter(d => d.priority >= 80).length;
  console.log(`📂 ${category}: ${urls.length} platforms (${highPriority} high priority)`);
});

const totalHighPriority = directories.filter(d => d.priority >= 80).length;
console.log(`\n⭐ Total High Priority platforms: ${totalHighPriority}`);
console.log(`📊 Priority Distribution:`);
console.log(`   High (90+): ${directories.filter(d => d.priority >= 90).length}`);
console.log(`   Medium-High (80-89): ${directories.filter(d => d.priority >= 80 && d.priority < 90).length}`);
console.log(`   Medium (60-79): ${directories.filter(d => d.priority >= 60 && d.priority < 80).length}`);
console.log(`   Low (40-59): ${directories.filter(d => d.priority < 60).length}`);
