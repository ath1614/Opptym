import React, { useState, useEffect } from 'react';
// Use axios directly with relative paths like other components
import axios from 'axios';
import { 
  Download, 
  Globe, 
  FileText, 
  Share2, 
  PenTool, 
  HelpCircle, 
  MapPin, 
  Copy, 
  Check, 
  Zap,
  ExternalLink,
  Bot,
  Sparkles,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Play,
  Settings,
  BookOpen,
  Megaphone
} from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

type Project = {
  _id: string;
  title: string;
  url: string;
  name?: string;
  email?: string;
  companyName?: string;
  businessPhone?: string;
  description?: string;
};

type SiteEntry = {
  name: string;
  url: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

const siteMap: Record<string, { 
  icon: JSX.Element; 
  sites: SiteEntry[];
  color: string;
  gradient: string;
  description: string;
}> = {
  directory: {
    icon: <MapPin className="w-5 h-5" />,
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Business directories and local listings',
    sites: [
      { name: 'Blahoo', url: 'https://www.blahoo.net/', description: 'Web directory', difficulty: 'easy' },
      { name: 'Caida', url: 'https://caida.eu/', description: 'European directory', difficulty: 'easy' },
      { name: 'Pink Linker', url: 'http://www.pinklinker.com/', description: 'Directory submission', difficulty: 'easy' },
      { name: 'Grey Linker', url: 'http://www.greylinker.com/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'SEO Deep Links', url: 'https://www.seodeeplinks.net/', description: 'SEO directory', difficulty: 'medium' },
      { name: 'SEO Range', url: 'https://www.seorange.com/', description: 'SEO directory', difficulty: 'medium' },
      { name: 'Leading Link Directory', url: 'https://www.leadinglinkdirectory.com/', description: 'Link directory', difficulty: 'medium' },
      { name: 'Red Linker', url: 'http://www.redlinker.com/', description: 'Directory submission', difficulty: 'easy' },
      { name: 'Webo World', url: 'https://www.weboworld.com/', description: 'Web directory', difficulty: 'easy' },
      { name: 'Yellow Linker', url: 'http://www.yellowlinker.com/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'Link Dir 4U', url: 'http://www.linkdir4u.com/', description: 'Link directory', difficulty: 'easy' },
      { name: 'World Web Directory', url: 'https://worldweb-directory.com/', description: 'Global web directory', difficulty: 'easy' },
      { name: 'WLD Directory', url: 'http://www.wlddirectory.com/', description: 'Web directory', difficulty: 'easy' },
      { name: 'Taurus Directory', url: 'http://www.taurusdirectory.com/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'Canopus Directory', url: 'http://www.canopusdirectory.com/', description: 'Directory submission', difficulty: 'easy' },
      { name: 'Vie Search', url: 'https://viesearch.com/', description: 'Search directory', difficulty: 'easy' },
      { name: 'Pro Link Directory', url: 'https://www.prolinkdirectory.com/', description: 'Professional directory', difficulty: 'medium' },
      { name: '01 Web Directory', url: 'https://www.01webdirectory.com/', description: 'Web directory', difficulty: 'easy' },
      { name: 'Directory Free', url: 'https://www.directory-free.com/', description: 'Free directory', difficulty: 'easy' },
      { name: 'Targets Views', url: 'http://www.targetsviews.com/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'More Funz', url: 'https://morefunz.com/', description: 'Fun directory', difficulty: 'easy' },
      { name: 'DR Test', url: 'http://www.drtest.net/', description: 'Directory submission', difficulty: 'easy' },
      { name: 'SEO Web Dir', url: 'https://www.seowebdir.net/', description: 'SEO directory', difficulty: 'medium' },
      { name: 'PR8 Directory', url: 'https://www.pr8directory.com/', description: 'High PR directory', difficulty: 'medium' },
      { name: 'Ellys Directory', url: 'https://ellysdirectory.com/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'Five Stars Auto Pawn', url: 'http://www.fivestarsautopawn.com/', description: 'Local directory', difficulty: 'easy' },
      { name: 'Favicon Style', url: 'https://faviconstyle.com/', description: 'Web directory', difficulty: 'easy' },
      { name: 'Idaho Index', url: 'http://www.idahoindex.com/', description: 'Local directory', difficulty: 'easy' },
      { name: 'Call Your Country', url: 'https://www.callyourcountry.com/', description: 'Country directory', difficulty: 'easy' },
      { name: 'Zopso', url: 'https://www.zopso.com/', description: 'Web directory', difficulty: 'easy' },
      { name: 'Gain Web', url: 'https://gainweb.org/', description: 'Web directory', difficulty: 'easy' },
      { name: 'DN2I', url: 'http://www.dn2i.com/', description: 'Directory listing', difficulty: 'easy' },
      { name: '247 Web Directory', url: 'https://www.247webdirectory.com/', description: '24/7 directory', difficulty: 'easy' },
      { name: '10 Directory', url: 'https://www.10directory.com/', description: 'Web directory', difficulty: 'easy' },
      { name: 'Canada Web Dir', url: 'https://www.canadawebdir.com/', description: 'Canadian directory', difficulty: 'easy' },
      { name: 'GCast Info', url: 'http://gcast.info/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'Propeller Dir', url: 'https://www.propellerdir.com/', description: 'Directory submission', difficulty: 'easy' },
      { name: 'Ahmedabad Backlink Power', url: 'http://ahmedabad.backlinkpower.com.ar/', description: 'Local directory', difficulty: 'easy' },
      { name: 'UK Directory', url: 'http://www.ukdirectory.com.ar/', description: 'UK directory', difficulty: 'easy' },
      { name: 'NC Directory', url: 'http://www.ncdirectory.com.ar/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'BLP Directory', url: 'http://www.blpdirectory.info/', description: 'Directory submission', difficulty: 'easy' },
      { name: '000 Directory', url: 'http://www.000directory.com.ar/', description: 'Web directory', difficulty: 'easy' },
      { name: 'VB Directory', url: 'http://www.vbdirectory.info/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'Work Directory', url: 'http://www.workdirectory.info/', description: 'Work directory', difficulty: 'easy' },
      { name: 'Hosting Tres', url: 'http://hostingtres.neobacklinks.com/', description: 'Hosting directory', difficulty: 'easy' },
      { name: 'Sergiu Ungureanu', url: 'http://sergiuungureanu.com/', description: 'Personal directory', difficulty: 'easy' },
      { name: 'VB Directory Info', url: 'http://vbdirectory.info/', description: 'Directory listing', difficulty: 'easy' },
      { name: 'Quick Directory', url: 'http://www.quickdirectory.biz/', description: 'Quick directory', difficulty: 'easy' },
      { name: 'Celestial Directory', url: 'http://www.celestialdirectory.com/', description: 'Directory submission', difficulty: 'easy' },
      { name: 'Link Nom', url: 'http://www.linknom.com/', description: 'Link directory', difficulty: 'easy' }
    ]
  },
  article: {
    icon: <FileText className="w-5 h-5" />,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-600',
    description: 'Article publishing and content platforms',
    sites: [
      { name: 'Medium', url: 'https://medium.com/', description: 'Popular blogging platform', difficulty: 'easy' },
      { name: 'Sooper Articles', url: 'https://www.sooperarticles.com/', description: 'Article submission directory', difficulty: 'easy' },
      { name: 'Amazines', url: 'https://www.amazines.com/', description: 'Article publishing platform', difficulty: 'easy' },
      { name: 'Niadd', url: 'https://www.niadd.com', description: 'Article directory', difficulty: 'easy' },
      { name: 'Tumblr', url: 'https://www.tumblr.com', description: 'Microblogging platform', difficulty: 'easy' },
      { name: 'Just Paste It', url: 'https://justpaste.it', description: 'Quick content sharing', difficulty: 'easy' },
      { name: 'Anotepad', url: 'https://anotepad.com', description: 'Note sharing platform', difficulty: 'easy' },
      { name: 'Patreon', url: 'https://www.patreon.com', description: 'Creator platform', difficulty: 'medium' },
      { name: 'Click4r', url: 'https://click4r.com', description: 'Content sharing platform', difficulty: 'easy' },
      { name: 'Diigo', url: 'https://www.diigo.com', description: 'Social bookmarking and annotation', difficulty: 'easy' },
      { name: 'APSense', url: 'https://www.apsense.com/', description: 'Social business network', difficulty: 'medium' },
      { name: 'Self Growth', url: 'https://www.selfgrowth.com/', description: 'Personal development articles', difficulty: 'medium' },
      { name: 'Jump Articles', url: 'http://www.jumparticles.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Article Geek', url: 'http://www.articlegeek.com/', description: 'Article submission site', difficulty: 'easy' },
      { name: 'Article Trunk', url: 'https://www.articletrunk.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'The Free Library', url: 'https://www.thefreelibrary.com/', description: 'Free article library', difficulty: 'easy' },
      { name: 'Article Biz', url: 'https://articlebiz.com/', description: 'Article marketing platform', difficulty: 'medium' },
      { name: '123 Article Online', url: 'https://www.123articleonline.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'A1 Articles', url: 'http://www.a1articles.com/', description: 'Article submission site', difficulty: 'easy' },
      { name: 'Article Doctor', url: 'http://www.articledoctor.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Other Articles', url: 'https://www.otherarticles.com/', description: 'Article submission platform', difficulty: 'easy' },
      { name: 'How To Advice', url: 'http://www.howtoadvice.com/', description: 'How-to article directory', difficulty: 'easy' },
      { name: 'Webmasters Library', url: 'http://www.webmasterslibrary.com/', description: 'Webmaster resources', difficulty: 'medium' },
      { name: 'Upload Article', url: 'https://uploadarticle.com/', description: 'Article submission site', difficulty: 'easy' },
      { name: 'Articles Need', url: 'https://articlesneed.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Actua Free Articles', url: 'http://actuafreearticles.com/', description: 'Free article directory', difficulty: 'easy' },
      { name: 'Article Cede', url: 'https://www.articlecede.com/', description: 'Article submission platform', difficulty: 'easy' },
      { name: 'Go2 Article', url: 'https://go2article.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Articles SS', url: 'http://articlesss.com/', description: 'Article submission site', difficulty: 'easy' },
      { name: 'Articles Base', url: 'https://articlesbase.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Articlization', url: 'https://www.articlization.com/', description: 'Article submission platform', difficulty: 'easy' },
      { name: 'Live Journal', url: 'https://www.livejournal.com/', description: 'Blogging platform', difficulty: 'easy' },
      { name: 'W Articles', url: 'https://www.warticles.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Netezine Articles', url: 'https://www.netezinearticles.com/', description: 'Article submission site', difficulty: 'easy' },
      { name: 'Articles For Website', url: 'https://articlesforwebsite.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Abilogic Articles', url: 'https://articles.abilogic.com/', description: 'Article submission platform', difficulty: 'easy' },
      { name: 'Articles List', url: 'http://www.articleslist.net/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Bloglovin', url: 'https://www.bloglovin.com/', description: 'Blog discovery platform', difficulty: 'easy' },
      { name: 'Article Cube', url: 'https://www.articlecube.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'Promotion World', url: 'https://www.promotionworld.com/', description: 'Marketing articles', difficulty: 'medium' },
      { name: 'Articles Seen', url: 'http://www.articleseen.com/', description: 'Article submission site', difficulty: 'easy' },
      { name: 'Article Side', url: 'https://articleside.com/', description: 'Article directory', difficulty: 'easy' },
      { name: 'DZone', url: 'https://dzone.com/', description: 'Developer community', difficulty: 'medium' },
      { name: 'Article Submission India', url: 'https://www.articlesubmission.co.in/', description: 'Indian article directory', difficulty: 'easy' },
      { name: 'High Rank Directory', url: 'https://www.highrankdirectory.com/', description: 'High PR directory', difficulty: 'medium' },
      { name: 'Marketing Internet Directory', url: 'https://www.marketinginternetdirectory.com/', description: 'Marketing directory', difficulty: 'medium' },
      { name: 'Pro Link Directory', url: 'https://www.prolinkdirectory.com/', description: 'Professional directory', difficulty: 'medium' },
      { name: 'Site Promotion Directory', url: 'https://www.sitepromotiondirectory.com/', description: 'Site promotion directory', difficulty: 'medium' },
      { name: 'Article Catalog', url: 'http://www.articlecatalog.com/', description: 'Article directory', difficulty: 'easy' }
    ]
  },
  social: {
    icon: <Share2 className="w-5 h-5" />,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-600',
    description: 'Social bookmarking and content sharing platforms',
    sites: [
      { name: 'Bookmarking Info', url: 'https://bookmarking.info/', description: 'Social bookmarking platform', difficulty: 'easy' },
      { name: 'Deals Classified', url: 'https://dealsclassified.online', description: 'Classified ads platform', difficulty: 'easy' },
      { name: 'City Classified', url: 'https://www.cityclassified.online', description: 'City classified ads', difficulty: 'easy' },
      { name: 'Bollywood Pasta', url: 'https://bollywoodpasta.com/', description: 'Entertainment platform', difficulty: 'easy' },
      { name: 'PR Bookmarking Club', url: 'https://prbookmarking.club', description: 'PR bookmarking service', difficulty: 'easy' },
      { name: 'Go Articles Info', url: 'https://www.goarticles.info/', description: 'Article bookmarking', difficulty: 'easy' },
      { name: 'SEO Khazana Tools', url: 'https://seokhazanatools.com', description: 'SEO tools platform', difficulty: 'medium' },
      { name: 'Samay Sawara', url: 'https://samaysawara.in', description: 'Content sharing platform', difficulty: 'easy' },
      { name: 'Local Bollywood Pasta', url: 'https://local.bollywoodpasta.com', description: 'Local entertainment', difficulty: 'easy' },
      { name: 'Samay Traffic', url: 'https://samaytraffic.samaysawara.in', description: 'Traffic generation', difficulty: 'medium' },
      { name: 'Advanced City Classified', url: 'https://advanced.cityclassified.online', description: 'Advanced classifieds', difficulty: 'medium' },
      { name: 'Urban Deals Classified', url: 'https://urban.dealsclassified.online', description: 'Urban classifieds', difficulty: 'easy' },
      { name: 'SEO Traffic Bookmarking', url: 'https://seotraffic.bookmarking.info', description: 'SEO traffic platform', difficulty: 'medium' },
      { name: 'PPC Web Samay Sawara', url: 'https://ppcweb.samaysawara.in', description: 'PPC platform', difficulty: 'medium' },
      { name: 'KS Pros SEO Khazana', url: 'https://kspros.seokhazanatools.com', description: 'SEO professional tools', difficulty: 'medium' },
      { name: 'Real Deals Classified', url: 'https://real.dealsclassified.online', description: 'Real deals platform', difficulty: 'easy' },
      { name: 'Samay Web', url: 'https://samayweb.samaysawara.in', description: 'Web platform', difficulty: 'easy' },
      { name: 'Samay Blog', url: 'https://samayblog.samaysawara.in', description: 'Blogging platform', difficulty: 'easy' },
      { name: 'City Tech', url: 'https://citytech.cityclassified.online', description: 'City technology', difficulty: 'medium' },
      { name: 'Video PR Bookmarking', url: 'https://video.prbookmarking.club', description: 'Video bookmarking', difficulty: 'easy' },
      { name: 'City SEO Khazana', url: 'https://city.seokhazanatools.com', description: 'City SEO tools', difficulty: 'medium' },
      { name: 'Pro SEO Samay Sawara', url: 'https://proseo.samaysawara.in', description: 'Professional SEO', difficulty: 'medium' },
      { name: 'PR Pros Bookmarking', url: 'https://prpros.prbookmarking.club', description: 'PR professionals', difficulty: 'medium' },
      { name: 'Click PR Bookmarking', url: 'https://click.prbookmarking.club', description: 'Click bookmarking', difficulty: 'easy' },
      { name: 'Deals Blog', url: 'https://dealsblog.dealsclassified.online', description: 'Deals blog platform', difficulty: 'easy' },
      { name: 'Brand PR Bookmarking', url: 'https://brand.prbookmarking.club', description: 'Brand bookmarking', difficulty: 'medium' },
      { name: 'Premier City Classified', url: 'https://premier.cityclassified.online', description: 'Premier classifieds', difficulty: 'medium' },
      { name: 'KS Traffic SEO Khazana', url: 'https://kstraffic.seokhazanatools.com', description: 'KS traffic tools', difficulty: 'medium' },
      { name: 'Fun Go Articles', url: 'https://fun.goarticles.info', description: 'Fun articles platform', difficulty: 'easy' },
      { name: 'Team SEO Bollywood Pasta', url: 'https://teamseo.bollywoodpasta.com/', description: 'Team SEO platform', difficulty: 'medium' },
      { name: 'SEO Blog Bookmarking', url: 'https://seoblog.bookmarking.info', description: 'SEO blog platform', difficulty: 'medium' },
      { name: 'Best SEO Online', url: 'https://bestseoonline.bookmarking.info/', description: 'Best SEO platform', difficulty: 'medium' },
      { name: 'Ocean City Classified', url: 'https://ocean.cityclassified.online', description: 'Ocean classifieds', difficulty: 'easy' },
      { name: 'Digital Deals Classified', url: 'https://digital.dealsclassified.online', description: 'Digital deals', difficulty: 'medium' },
      { name: 'World Deals Classified', url: 'https://world.dealsclassified.online', description: 'World deals', difficulty: 'easy' },
      { name: 'Digital News Samay Sawara', url: 'https://digitalnews.samaysawara.in', description: 'Digital news platform', difficulty: 'medium' },
      { name: 'City Blog City Classified', url: 'https://cityblog.cityclassified.online', description: 'City blog platform', difficulty: 'easy' },
      { name: 'Top SEO Online', url: 'https://topseoonline.bookmarking.info/', description: 'Top SEO platform', difficulty: 'medium' },
      { name: 'Relax SEO Khazana', url: 'https://relax.seokhazanatools.com', description: 'Relax SEO tools', difficulty: 'easy' },
      { name: 'SEO Link PR Bookmarking', url: 'https://seolink.prbookmarking.club', description: 'SEO link bookmarking', difficulty: 'medium' },
      { name: 'City PPC City Classified', url: 'https://cityppc.cityclassified.online', description: 'City PPC platform', difficulty: 'medium' },
      { name: 'Way In SEO Khazana', url: 'https://wayin.seokhazanatools.com', description: 'Way in SEO tools', difficulty: 'medium' },
      { name: 'SMO Art Samay Sawara', url: 'https://smoart.samaysawara.in', description: 'SMO art platform', difficulty: 'medium' },
      { name: 'Samay Pros Samay Sawara', url: 'https://samaypros.samaysawara.in', description: 'Samay professionals', difficulty: 'medium' },
      { name: 'Sites Go Articles', url: 'https://sites.goarticles.info', description: 'Sites articles platform', difficulty: 'easy' },
      { name: 'My SEO Online', url: 'https://myseooonline.bookmarking.info/', description: 'My SEO online', difficulty: 'medium' },
      { name: 'Deals PPC Deals Classified', url: 'https://dealsppc.dealsclassified.online', description: 'Deals PPC platform', difficulty: 'medium' },
      { name: 'Samay Tech Samay Sawara', url: 'https://samaytech.samaysawara.in', description: 'Samay technology', difficulty: 'medium' },
      { name: 'Book Bollywood Pasta', url: 'https://book.bollywoodpasta.com', description: 'Book entertainment', difficulty: 'easy' }
    ]
  },
  web2: {
    icon: <PenTool className="w-5 h-5" />,
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Web 2.0 and blogging platforms',
    sites: [
      { name: 'WordPress', url: 'https://wordpress.com/', description: 'Popular CMS platform', difficulty: 'medium' },
      { name: 'Blogger', url: 'https://www.blogger.com/', description: 'Google\'s blogging platform', difficulty: 'easy' },
      { name: 'Evernote', url: 'https://evernote.com/', description: 'Note-taking platform', difficulty: 'easy' },
      { name: 'Weebly', url: 'https://www.weebly.com/in', description: 'Website builder', difficulty: 'easy' },
      { name: 'Yola', url: 'https://www.yola.com/', description: 'Website builder', difficulty: 'easy' },
      { name: 'Google Sites', url: 'https://sites.google.com/', description: 'Google website builder', difficulty: 'easy' },
      { name: 'Strikingly', url: 'https://www.strikingly.com/', description: 'Single-page website builder', difficulty: 'easy' },
      { name: 'Medium', url: 'https://medium.com/', description: 'Blogging platform', difficulty: 'easy' },
      { name: 'Wikidot', url: 'http://www.wikidot.com/', description: 'Wiki platform', difficulty: 'medium' },
      { name: 'Live Journal', url: 'https://www.livejournal.com/', description: 'Blogging platform', difficulty: 'easy' },
      { name: 'Tumblr', url: 'https://www.tumblr.com/', description: 'Microblogging platform', difficulty: 'easy' },
      { name: 'Scoop It', url: 'https://www.scoop.it/', description: 'Content curation platform', difficulty: 'medium' },
      { name: 'Anotepad', url: 'https://anotepad.com/', description: 'Note sharing platform', difficulty: 'easy' },
      { name: 'PBase', url: 'https://pbase.com/', description: 'Photo sharing platform', difficulty: 'easy' },
      { name: 'Control C', url: 'https://controlc.com/', description: 'Text sharing platform', difficulty: 'easy' },
      { name: 'Website.com', url: 'https://www.website.com/', description: 'Website builder', difficulty: 'easy' },
      { name: 'Wix', url: 'https://www.wix.com/', description: 'Website builder', difficulty: 'medium' },
      { name: 'Site123', url: 'https://site123.com/', description: 'Website builder', difficulty: 'easy' },
      { name: 'Instapaper', url: 'https://www.instapaper.com/', description: 'Read later service', difficulty: 'easy' },
      { name: 'Notion', url: 'https://www.notion.so/', description: 'Workspace platform', difficulty: 'medium' },
      { name: 'Slashdot', url: 'https://slashdot.org/', description: 'Tech news platform', difficulty: 'medium' },
      { name: 'Squarespace Blog', url: 'https://squarespaceblog.com/', description: 'Blogging platform', difficulty: 'medium' },
      { name: 'DeviantArt', url: 'https://www.deviantart.com/', description: 'Art community', difficulty: 'easy' },
      { name: 'Webnode', url: 'https://us.webnode.com/', description: 'Website builder', difficulty: 'easy' },
      { name: 'Paste Link', url: 'https://pastelink.net/', description: 'Text sharing platform', difficulty: 'easy' },
      { name: 'Youslade', url: 'https://youslade.com/', description: 'Content platform', difficulty: 'easy' },
      { name: 'Afriprime', url: 'https://afriprime.net/', description: 'African content platform', difficulty: 'easy' },
      { name: 'Bib AZ', url: 'https://www.bib.az/', description: 'Content platform', difficulty: 'easy' },
      { name: 'Lyfe Pal', url: 'https://lyfepal.com/', description: 'Life sharing platform', difficulty: 'easy' },
      { name: 'V Blogetin', url: 'https://vblogetin.com/', description: 'Blogging platform', difficulty: 'easy' },
      { name: 'Win Blog', url: 'https://win-blog.com/', description: 'Blogging platform', difficulty: 'easy' },
      { name: 'Daily Blogzz', url: 'https://dailyblogzz.com/', description: 'Daily blogging platform', difficulty: 'easy' },
      { name: 'News Bloger', url: 'https://newsbloger.com/', description: 'News blogging platform', difficulty: 'easy' },
      { name: 'ClickUp', url: 'https://clickup.com/', description: 'Productivity platform', difficulty: 'medium' },
      { name: 'Zoho Sites', url: 'https://www.zoho.com/sites/', description: 'Website builder', difficulty: 'medium' },
      { name: 'Typepad', url: 'https://www.typepad.com/', description: 'Blogging platform', difficulty: 'medium' },
      { name: 'Hashnode', url: 'https://hashnode.com/', description: 'Developer blogging platform', difficulty: 'medium' },
      { name: 'Tech Planet Today', url: 'https://techplanet.today/', description: 'Tech news platform', difficulty: 'medium' },
      { name: 'My Meet Book', url: 'https://www.mymeetbook.com/welcome', description: 'Meeting platform', difficulty: 'easy' },
      { name: 'Ekonty', url: 'https://ekonty.com/', description: 'Content platform', difficulty: 'easy' },
      { name: 'Edu Blogs', url: 'https://edublogs.org/', description: 'Educational blogging', difficulty: 'easy' },
      { name: 'Blog Pixi', url: 'https://blogpixi.com/', description: 'Blogging platform', difficulty: 'easy' },
      { name: 'One Page Website', url: 'https://onepage.website/', description: 'Single page website', difficulty: 'easy' },
      { name: 'Post Heaven', url: 'https://postheaven.net', description: 'Posting platform', difficulty: 'easy' },
      { name: 'Kekogram', url: 'https://www.kekogram.com', description: 'Content platform', difficulty: 'easy' },
      { name: 'Community Wong CW', url: 'https://community.wongcw.com', description: 'Community platform', difficulty: 'easy' },
      { name: 'Campus Acada', url: 'https://www.campusacada.com', description: 'Academic platform', difficulty: 'easy' },
      { name: 'Blog2Freedom', url: 'https://blog2freedom.com/', description: 'Freedom blogging', difficulty: 'easy' },
      { name: 'Bloggip', url: 'https://bloggip.com/', description: 'Blogging platform', difficulty: 'easy' },
      { name: 'Qods Blog', url: 'https://qodsblog.com/', description: 'Blogging platform', difficulty: 'easy' }
    ]
  },
  press: {
    icon: <Megaphone className="w-5 h-5" />,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-violet-600',
    description: 'Press release distribution platforms',
    sites: [
      { name: 'PR Log', url: 'https://www.prlog.org/', description: 'Free press release distribution', difficulty: 'easy' },
      { name: '1888 Press Release', url: 'https://www.1888pressrelease.com/', description: 'Press release service', difficulty: 'medium' },
      { name: 'Press Box', url: 'https://www.pressbox.com/', description: 'Press release platform', difficulty: 'medium' },
      { name: '24-7 Press Release', url: 'https://www.24-7pressrelease.com/', description: '24/7 press release service', difficulty: 'medium' },
      { name: 'PR Newswire', url: 'https://www.prnewswire.com/', description: 'Leading press release service', difficulty: 'hard' },
      { name: 'Real Time Press Release', url: 'https://realtimepressrelease.com/', description: 'Real-time press releases', difficulty: 'medium' },
      { name: 'PRBD', url: 'http://www.prbd.net/', description: 'Press release platform', difficulty: 'easy' },
      { name: 'PR Fire UK', url: 'https://www.prfire.co.uk/', description: 'UK press release service', difficulty: 'medium' },
      { name: 'PR Urgent', url: 'https://www.prurgent.com/', description: 'Urgent press release service', difficulty: 'medium' },
      { name: 'Express Press Release', url: 'https://express-press-release.net/', description: 'Express press release', difficulty: 'easy' },
      { name: 'PR Sync', url: 'http://prsync.com/', description: 'Press release synchronization', difficulty: 'medium' },
      { name: 'For Press Release', url: 'https://www.forpressrelease.com/', description: 'Press release platform', difficulty: 'medium' },
      { name: 'PR Web', url: 'http://www.prweb.com/', description: 'Press release web service', difficulty: 'medium' },
      { name: 'PR Wires', url: 'https://www.prwires.com/', description: 'Press release wire service', difficulty: 'medium' },
      { name: '24 Newswire', url: 'https://www.24newswire.com/', description: '24-hour newswire', difficulty: 'medium' }
    ]
  },
  australia: {
    icon: <Globe className="w-5 h-5" />,
    color: 'text-green-600',
    gradient: 'from-green-500 to-teal-600',
    description: 'Australia business listings and directories',
    sites: [
      { name: 'Enroll Business AT', url: 'https://at.enrollbusiness.com/', description: 'Austrian business directory', difficulty: 'easy' },
      { name: 'Kompass AT', url: 'https://at.kompass.com/', description: 'Austrian business directory', difficulty: 'medium' },
      { name: 'Hotfrog AT', url: 'https://www.hotfrog.at/', description: 'Austrian business directory', difficulty: 'easy' },
      { name: 'Cylex AT', url: 'https://www.cylex.at/', description: 'Austrian business directory', difficulty: 'easy' },
      { name: 'Koomio', url: 'https://koomio.com/', description: 'Business directory', difficulty: 'easy' },
      { name: 'Finde Offen AT', url: 'https://finde-offen.at/', description: 'Austrian business finder', difficulty: 'easy' },
      { name: 'Manta', url: 'https://www.manta.com/', description: 'Business directory', difficulty: 'easy' },
      { name: 'Cylex Australia', url: 'https://www.cylex-australia.com/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'La Cartes', url: 'http://www.lacartes.com/', description: 'Business directory', difficulty: 'easy' },
      { name: 'True Local', url: 'https://www.truelocal.com.au/', description: 'Australian local business', difficulty: 'easy' },
      { name: 'Yelp Australia', url: 'https://www.yelp.com.au/', description: 'Australian review platform', difficulty: 'easy' },
      { name: '2 Find Local', url: 'https://www.2findlocal.com/', description: 'Local business finder', difficulty: 'easy' },
      { name: 'Search Frog', url: 'https://searchfrog.com.au/', description: 'Australian search directory', difficulty: 'easy' },
      { name: 'Word of Mouth', url: 'https://www.wordofmouth.com.au/', description: 'Australian review platform', difficulty: 'easy' },
      { name: 'Hotfrog Australia', url: 'https://www.hotfrog.com.au/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Enroll Business AU', url: 'https://au.enrollbusiness.com/Home', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Zipleaf AU', url: 'https://au.zipleaf.com/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Start Local', url: 'https://www.startlocal.com.au/', description: 'Australian local business', difficulty: 'easy' },
      { name: 'Yalwa Australia', url: 'https://www.yalwa.com.au/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Local Search', url: 'https://www.localsearch.com.au/', description: 'Australian local search', difficulty: 'easy' },
      { name: 'Local AU Directory', url: 'https://www.local.com.au/directory', description: 'Australian local directory', difficulty: 'easy' },
      { name: 'AGFG', url: 'https://www.agfg.com.au/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Local Business Guide', url: 'https://www.localbusinessguide.com.au/', description: 'Australian business guide', difficulty: 'easy' },
      { name: 'Open Directory AU', url: 'https://www.opendi.com.au/', description: 'Australian open directory', difficulty: 'easy' },
      { name: 'True Finders', url: 'https://truefinders.com.au/', description: 'Australian business finder', difficulty: 'easy' },
      { name: 'My Home Improvement', url: 'https://myhomeimprovement.com.au/', description: 'Australian home improvement', difficulty: 'easy' },
      { name: 'Search Nearby', url: 'https://searchnearby.com.au/', description: 'Australian nearby search', difficulty: 'easy' },
      { name: 'Service Finders', url: 'https://servicefinders.com.au/', description: 'Australian service finder', difficulty: 'easy' },
      { name: 'Aussie Web', url: 'https://www.aussieweb.com.au/', description: 'Australian web directory', difficulty: 'easy' },
      { name: 'iGlobal Australia', url: 'https://www.iglobal.co/australia', description: 'Global Australian directory', difficulty: 'easy' },
      { name: 'Super Pages AU', url: 'https://www.superpages.com.au/', description: 'Australian super pages', difficulty: 'easy' },
      { name: 'Fyple', url: 'https://www.fyple.biz/', description: 'Business directory', difficulty: 'easy' },
      { name: 'Brown Book', url: 'https://www.brownbook.net/', description: 'Business directory', difficulty: 'easy' },
      { name: 'Pink Pages', url: 'https://pinkpages.com.au/', description: 'Australian pink pages', difficulty: 'easy' },
      { name: 'Cybo', url: 'https://www.cybo.com/', description: 'Business directory', difficulty: 'easy' },
      { name: 'National Directory', url: 'https://nationaldirectory.com.au/', description: 'Australian national directory', difficulty: 'easy' },
      { name: 'Look Local', url: 'https://www.looklocal.net.au/', description: 'Australian local directory', difficulty: 'easy' },
      { name: 'Directory AU', url: 'https://directory.com.au/', description: 'Australian directory', difficulty: 'easy' },
      { name: 'Business Directory AU', url: 'https://www.business.directoryofaustralia.com.au/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Yellow Pages AU', url: 'https://www.yellowpages.com.au/', description: 'Australian yellow pages', difficulty: 'easy' },
      { name: 'Business Listings AU', url: 'https://www.businesslistings.net.au/', description: 'Australian business listings', difficulty: 'easy' },
      { name: 'Where Is', url: 'https://www.whereis.com/', description: 'Australian location finder', difficulty: 'easy' },
      { name: 'Australia Biz Dir', url: 'https://www.australiabizdir.com/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'A to Z Pages', url: 'https://www.atozpages.com.au/', description: 'Australian A-Z directory', difficulty: 'easy' },
      { name: 'Acompio Australia', url: 'https://australia.acompio.com', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Place 123', url: 'http://www.place123.net', description: 'Place directory', difficulty: 'easy' },
      { name: 'Ausi Archive', url: 'https://www.ausiarchive.biz/', description: 'Australian archive', difficulty: 'easy' },
      { name: 'Ausi Biz', url: 'https://www.ausibiz.com/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Oztrov', url: 'https://oztrov.com.au/', description: 'Australian business finder', difficulty: 'easy' },
      { name: 'Ausi Listings', url: 'https://www.auslistings.org/', description: 'Australian listings', difficulty: 'easy' }
    ]
  },
  classified: {
    icon: <FileText className="w-5 h-5" />,
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-red-600',
    description: 'Australian classified ads platforms',
    sites: [
      { name: 'The West Classifieds', url: 'https://www.thewestclassifieds.com.au/', description: 'Western Australian classifieds', difficulty: 'easy' },
      { name: 'AU Free Ads', url: 'http://www.aufreeads.com/', description: 'Australian free ads', difficulty: 'easy' },
      { name: 'Locanto Australia', url: 'https://www.locanto.com.au/', description: 'Australian classifieds', difficulty: 'easy' },
      { name: 'Gumtree Australia', url: 'https://www.gumtree.com.au/', description: 'Australian classifieds', difficulty: 'easy' },
      { name: 'Hotfrog Australia', url: 'https://www.hotfrog.com.au/', description: 'Australian business directory', difficulty: 'easy' },
      { name: 'Just Landed Classifieds', url: 'https://classifieds.justlanded.com/', description: 'International classifieds', difficulty: 'easy' },
      { name: 'Post My Ads', url: 'https://www.postmyads.com.au/', description: 'Australian ad posting', difficulty: 'easy' },
      { name: 'Global Free Classified Ads', url: 'https://au.global-free-classified-ads.com/', description: 'Global free classifieds', difficulty: 'easy' },
      { name: 'AU Classifieds', url: 'https://www.auclassifieds.com.au/', description: 'Australian classifieds', difficulty: 'easy' },
      { name: 'Chaos Ads', url: 'https://www.chaosads.com/', description: 'Classified ads platform', difficulty: 'easy' },
      { name: 'Cavalletti', url: 'https://www.cavalletti.com.au/', description: 'Australian classifieds', difficulty: 'easy' },
      { name: 'Buy Search Sell', url: 'https://www.buysearchsell.com.au/', description: 'Australian marketplace', difficulty: 'easy' },
      { name: 'Go Post', url: 'http://gopost.com.au/', description: 'Australian posting platform', difficulty: 'easy' },
      { name: 'Classified Ads', url: 'https://www.classifiedads.com/', description: 'General classifieds', difficulty: 'easy' },
      { name: 'Uy Cart', url: 'http://uycart.com/', description: 'Classified ads platform', difficulty: 'easy' },
      { name: 'Pixolinks', url: 'http://pixolinks.com/', description: 'Classified ads platform', difficulty: 'easy' },
      { name: 'FDL Classifieds', url: 'https://fdlclassifieds.com/', description: 'Classified ads platform', difficulty: 'easy' },
      { name: 'Postez Ads', url: 'https://postezads.com/', description: 'Ad posting platform', difficulty: 'easy' },
      { name: 'Instant Adz', url: 'https://instantadz.com/', description: 'Instant ad platform', difficulty: 'easy' },
      { name: 'Post Quick Ads', url: 'https://postquickads.com/', description: 'Quick ad posting', difficulty: 'easy' },
      { name: 'Classifieds 4 Free', url: 'https://classifieds4free.com/', description: 'Free classifieds', difficulty: 'easy' },
      { name: 'Post Smart Ads', url: 'https://postsmartads.com/', description: 'Smart ad posting', difficulty: 'easy' },
      { name: 'Tot Ads', url: 'https://totads.com/', description: 'Total ads platform', difficulty: 'easy' },
      { name: 'P Classified', url: 'https://pclassified.com/', description: 'Classified ads platform', difficulty: 'easy' },
      { name: 'Classifieds Home', url: 'https://classifiedshome.com/', description: 'Classifieds home', difficulty: 'easy' },
      { name: 'Classifieds Link', url: 'https://classifiedslink.com/', description: 'Classifieds link', difficulty: 'easy' },
      { name: 'Total Classified', url: 'https://totalclassified.com/', description: 'Total classifieds', difficulty: 'easy' },
      { name: 'One Buy Sales', url: 'https://onebuysales.com/', description: 'Buy and sell platform', difficulty: 'easy' },
      { name: 'Total Classifieds', url: 'https://totalclassifieds.com/', description: 'Total classifieds', difficulty: 'easy' },
      { name: 'Com Adz', url: 'https://comadz.com/', description: 'Commercial ads platform', difficulty: 'easy' },
      { name: 'Pro Free Ads', url: 'https://profreeads.com/', description: 'Professional free ads', difficulty: 'easy' },
      { name: 'Postez Ad', url: 'http://postezad.com/', description: 'Ad posting platform', difficulty: 'easy' },
      { name: 'Ads Lov', url: 'http://www.adslov.com/', description: 'Ads love platform', difficulty: 'easy' },
      { name: 'Pet Ads Hub', url: 'http://www.petadshub.com/', description: 'Pet ads platform', difficulty: 'easy' },
      { name: 'F Web Directory', url: 'https://fwebdirectory.com/', description: 'Web directory', difficulty: 'easy' },
      { name: 'Ads Hoo', url: 'https://adshoo.com/', description: 'Ads platform', difficulty: 'easy' },
      { name: 'Urs Ads', url: 'http://ursads.com/', description: 'Your ads platform', difficulty: 'easy' },
      { name: 'Ad Post Australia', url: 'https://www.adpost.com/au/', description: 'Australian ad posting', difficulty: 'easy' },
      { name: 'Tokyo Craigslist', url: 'https://tokyo.craigslist.org/', description: 'Tokyo classifieds', difficulty: 'easy' },
      { name: 'Uno List Australia', url: 'http://unolist.com.au/', description: 'Australian uno list', difficulty: 'easy' },
      { name: 'Business Listings AU', url: 'https://www.businesslistings.net.au/', description: 'Australian business listings', difficulty: 'easy' },
      { name: 'True Finders', url: 'https://truefinders.com.au/', description: 'Australian business finder', difficulty: 'easy' },
      { name: 'VK Classifieds AU', url: 'http://www.vkclassifieds.net.au/', description: 'Australian VK classifieds', difficulty: 'easy' },
      { name: 'Top Free Classifieds', url: 'https://www.topfreeclassifieds.com/', description: 'Top free classifieds', difficulty: 'easy' },
      { name: 'Adeex Australia', url: 'https://www.adeexaustralia.com/', description: 'Australian ad platform', difficulty: 'easy' },
      { name: 'Fold Ads', url: 'https://foldads.com/', description: 'Fold ads platform', difficulty: 'easy' },
      { name: 'Next Free Ads', url: 'http://nextfreeads.com/', description: 'Next free ads', difficulty: 'easy' },
      { name: 'Free Best Ads', url: 'http://freebestads.com/', description: 'Free best ads', difficulty: 'easy' },
      { name: 'Get Ads Online', url: 'http://getadsonline.com/', description: 'Get ads online', difficulty: 'easy' }
    ]
  },
  qa: {
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'text-red-600',
    gradient: 'from-red-500 to-orange-600',
    description: 'Q&A and community platforms',
    sites: [
      { name: 'Quora', url: 'https://www.quora.com/', description: 'Question and answer platform', difficulty: 'medium' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com/questions/ask', description: 'Developer Q&A platform', difficulty: 'hard' },
      { name: 'Reddit Ask', url: 'https://www.reddit.com/r/AskReddit/', description: 'Community discussion platform', difficulty: 'medium' },
      { name: 'SuperUser', url: 'https://superuser.com/questions/ask', description: 'Tech support Q&A', difficulty: 'hard' },
      { name: 'Answerbag', url: 'https://www.answerbag.com/', description: 'General Q&A platform', difficulty: 'easy' }
    ]
  }
};

const SubmissionsDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAutoFillScript, setShowAutoFillScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      
      // Use axios with relative path like other components
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Projects fetched:', response.data);
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setProjectsError(err.response?.data?.error || err.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectSelect = (id: string) => {
    const found = (projects || []).find(p => p._id === id) || null;
    setSelectedProject(found);
    if (found) {
      localStorage.setItem('selectedProject', found._id);
    }
  };

  // Ultra-Smart Puppeteer function to open new Chrome browser and auto-fill
  const openTabAndUltraSmartFill = async (url: string) => {
    if (!selectedProject) {
      alert("⚠️ Please select a project first!");
      return;
    }

    try {
      // Show loading state
      alert("🔄 Starting Ultra-Smart automation on server...\n\n🤖 Browser automation is running in the background!\n⏱️ Please wait while forms are being filled...");
      
      // Get the backend URL from environment or use default
      const backendUrl = import.meta.env.VITE_API_URL || 'https://opptym-backend.onrender.com';
      
      // Call the backend automation which will open a new Chrome browser
      const response = await fetch(`${backendUrl}/api/ultra-smart/open-and-ultra-fill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: url,
          projectId: selectedProject._id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`🤖 ULTRA-SMART FILLING COMPLETE!\n\n✅ ${result.filledCount} fields filled successfully\n⏱️ Processing time: ${result.processingTime}\n🎯 Accuracy: ${result.accuracy}%\n🌐 Target URL: ${result.url}\n\n✅ Automation completed on server!\n📋 Check the target website for filled forms.`);
      } else {
        alert(`❌ Automation failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Ultra-smart automation error:', error);
      alert('❌ Ultra-smart automation failed. Please try again.');
    }
  };

  // Universal Form Puppeteer function to open new Chrome browser and auto-fill ANY form system
  const openTabAndUniversalFill = async (url: string) => {
    if (!selectedProject) {
      alert('⚠️ Please select a project first!');
      return;
    }

    setLoading(true);
    try {
      // Show loading state
      alert("🔄 Starting Universal Form automation on server...\n\n🤖 Browser automation is running in the background!\n⏱️ Please wait while forms are being filled...");
      
      // Get the backend URL from environment or use default
      const backendUrl = import.meta.env.VITE_API_URL || 'https://opptym-backend.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/universal-form/${selectedProject._id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: url,
          projectId: selectedProject._id
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`🌍 UNIVERSAL FORM FILLING COMPLETE!\n\n✅ ${result.automationResults?.successfulSubmissions || 0} submissions successful\n⏱️ Processing time: ${result.automationResults?.processingTime || 'N/A'}\n📊 Total directories: ${result.automationResults?.totalSubmissions || 0}\n🌐 Target URL: ${result.url}\n\n✅ Automation completed on server!\n📋 Check the target website for filled forms.`);
      } else {
        const errorMsg = result.message || result.error || 'Unknown error';
        alert(`❌ Universal form automation failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Universal form automation error:', error);
      alert('❌ Universal form automation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate auto-fill script
  const generateAutoFillScript = () => {
    if (!selectedProject) return '';
    
    return `// Auto-Fill Script for ${selectedProject.title}
// Copy and paste this in browser console (F12)

const projectData = {
  name: "${selectedProject.name || ''}",
  email: "${selectedProject.email || ''}",
  companyName: "${selectedProject.companyName || ''}",
  phone: "${selectedProject.businessPhone || ''}",
  description: "${selectedProject.description || ''}",
  url: "${selectedProject.url || ''}"
};

// Fill common form fields
document.querySelectorAll('input, textarea, select').forEach(field => {
  const fieldName = field.name || field.id || field.placeholder || '';
  const fieldValue = field.value || '';
  
  if (fieldName.toLowerCase().includes('name') && !fieldValue) {
    field.value = projectData.name;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('email') && !fieldValue) {
    field.value = projectData.email;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('company') && !fieldValue) {
    field.value = projectData.companyName;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('phone') && !fieldValue) {
    field.value = projectData.phone;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('url') && !fieldValue) {
    field.value = projectData.url;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  else if (fieldName.toLowerCase().includes('description') && !fieldValue) {
    field.value = projectData.description;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

console.log('✅ Auto-fill script executed for:', projectData.companyName || projectData.name);`;
  };

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(generateAutoFillScript());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SEO Submissions Hub
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Streamline your SEO submissions with our intelligent automation tools. 
            Choose your project and let our AI-powered systems handle the rest.
          </p>
        </div>

        {/* Project Selection Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">Project Configuration</h2>
              <p className="text-sm text-gray-600">Select the project you want to submit</p>
            </div>
            
            <button
              onClick={() => {
                setProjectsLoading(true);
                setProjectsError(null);
                fetchProjects();
              }}
              disabled={projectsLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {projectsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Project Selection Dropdown */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedProject?._id || ''}
                onChange={(e) => handleProjectSelect(e.target.value)}
                disabled={projectsLoading}
                className="flex-1 border border-gray-200 px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {projectsLoading ? 'Loading projects...' : '-- Select your project --'}
                </option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
              
              {selectedProject && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Project Selected</span>
                </div>
              )}
            </div>

            {/* Loading and Error States */}
            {projectsLoading && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading projects...</span>
              </div>
            )}
            
            {projectsError && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Error: {projectsError}</span>
              </div>
            )}
            
            {!projectsLoading && !projectsError && projects.length === 0 && (
              <div className="flex items-center space-x-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>No projects found. Create a project first to use submission tools.</span>
              </div>
            )}
            
            {!projectsLoading && !projectsError && projects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{projects.length} project{projects.length !== 1 ? 's' : ''} available</span>
                </div>
                
                {/* Debug info - remove in production */}
                <details className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  <summary className="cursor-pointer hover:text-gray-700">Debug: Show project details</summary>
                  <div className="mt-2 space-y-1">
                    {projects.map((p, index) => (
                      <div key={p._id} className="font-mono">
                        [{index}] ID: {p._id}, Title: {p.title}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Fill Script Section */}
        {showAutoFillScript && selectedProject && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">🤖 Auto-Fill Script</h3>
                <p className="text-sm text-gray-600">Copy and paste this script in the browser console</p>
              </div>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-6 rounded-xl text-sm font-mono overflow-x-auto border border-gray-700">
              <pre className="whitespace-pre-wrap">{generateAutoFillScript()}</pre>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={copyScript}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Script'}
              </button>
              
              <div className="text-xs text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                <strong>How to use:</strong> Open form page → Press <kbd className="bg-gray-200 px-2 py-1 rounded text-xs mx-1">F12</kbd> → Paste script → Press Enter
              </div>
            </div>
          </div>
        )}

        {/* Platform Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(siteMap).map(([category, { icon, sites, color, gradient, description }]) => (
            <div key={category} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold capitalize">{category} Platforms</h3>
                    <p className="text-white/80 text-sm">{description}</p>
                  </div>
                </div>
              </div>
              
              {/* Platform List */}
              <div className="p-6 space-y-3">
                {(expandedCategories.has(category) ? sites : sites.slice(0, 5)).map((site) => (
                  <div key={site.name} className="bg-gray-50/50 rounded-xl p-4 hover:bg-gray-100/50 transition-all border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-800">{site.name}</h4>
                          {site.difficulty && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(site.difficulty)}`}>
                              {site.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{site.description}</p>
                        <a 
                          href={site.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center space-x-1"
                        >
                          <span>{site.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => openTabAndUltraSmartFill(site.url)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                          title="Ultra-Smart Fill"
                        >
                          <Bot className="w-3 h-3 mr-1" />
                          Ultra-Smart
                        </button>
                        
                        <button
                          onClick={() => openTabAndUniversalFill(site.url)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                          title="Universal Form Fill"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Universal
                        </button>
                        
                        <button
                          onClick={() => window.open(site.url, '_blank')}
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                          title="Open in New Tab"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show More/Less Button */}
                {sites.length > 5 && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => toggleCategoryExpansion(category)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg"
                    >
                      {expandedCategories.has(category) ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Show Less ({sites.length - 5} hidden)
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Show More ({sites.length - 5} more)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Automation Status */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Automation Ready</h3>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Ultra-Smart System</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Universal Form System</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Chrome Integration</span>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Quick Guide</h3>
                <p className="text-sm text-gray-600">How to use automation</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Select your project</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Choose automation type</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Watch the magic happen!</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-xl border border-purple-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Platform Stats</h3>
                <p className="text-sm text-gray-600">Available platforms</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Platforms</span>
                <span className="text-lg font-bold text-purple-600">25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categories</span>
                <span className="text-lg font-bold text-purple-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-lg font-bold text-green-600">95%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Show Script Button */}
        {selectedProject && !showAutoFillScript && (
          <div className="text-center">
            <button
              onClick={() => setShowAutoFillScript(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Bot className="w-4 h-4 mr-2" />
              Show Auto-Fill Script
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsDashboard;