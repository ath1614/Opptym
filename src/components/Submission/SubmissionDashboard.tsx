import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Use axios directly with relative paths like other components
import axios from 'axios';
import { ClientAutomationService } from '../../services/ClientAutomationService';
import { UniversalFormService } from '../../services/UniversalFormService';
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
  Megaphone,
  Bookmark,
  Trash2,
  Loader
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
      { name: 'Caida', url: 'https://caida.eu/submit.php', description: 'European directory', difficulty: 'easy' },
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
      { name: 'US Directory', url: 'http://www.usdirectory.com.ar/', description: 'US directory', difficulty: 'easy' },
      { name: 'Canada Directory', url: 'http://www.canadadirectory.com.ar/', description: 'Canada directory', difficulty: 'easy' },
      { name: 'Australia Directory', url: 'http://www.australiadirectory.com.ar/', description: 'Australia directory', difficulty: 'easy' },
      { name: 'India Directory', url: 'http://www.indiadirectory.com.ar/', description: 'India directory', difficulty: 'easy' },
      { name: 'Brazil Directory', url: 'http://www.brazildirectory.com.ar/', description: 'Brazil directory', difficulty: 'easy' },
      { name: 'Mexico Directory', url: 'http://www.mexicodirectory.com.ar/', description: 'Mexico directory', difficulty: 'easy' },
      { name: 'Argentina Directory', url: 'http://www.argentinadirectory.com.ar/', description: 'Argentina directory', difficulty: 'easy' },
      { name: 'Chile Directory', url: 'http://www.chiledirectory.com.ar/', description: 'Chile directory', difficulty: 'easy' },
      { name: 'Peru Directory', url: 'http://www.perudirectory.com.ar/', description: 'Peru directory', difficulty: 'easy' },
      { name: 'Colombia Directory', url: 'http://www.colombiadirectory.com.ar/', description: 'Colombia directory', difficulty: 'easy' },
      { name: 'Venezuela Directory', url: 'http://www.venezueladirectory.com.ar/', description: 'Venezuela directory', difficulty: 'easy' },
      { name: 'Ecuador Directory', url: 'http://www.ecuadordirectory.com.ar/', description: 'Ecuador directory', difficulty: 'easy' },
      { name: 'Bolivia Directory', url: 'http://www.boliviadirectory.com.ar/', description: 'Bolivia directory', difficulty: 'easy' },
      { name: 'Paraguay Directory', url: 'http://www.paraguaydirectory.com.ar/', description: 'Paraguay directory', difficulty: 'easy' },
      { name: 'Uruguay Directory', url: 'http://www.uruguaydirectory.com.ar/', description: 'Uruguay directory', difficulty: 'easy' },
      { name: 'Guyana Directory', url: 'http://www.guyanadirectory.com.ar/', description: 'Guyana directory', difficulty: 'easy' },
      { name: 'Suriname Directory', url: 'http://www.surinamedirectory.com.ar/', description: 'Suriname directory', difficulty: 'easy' },
      { name: 'French Guiana Directory', url: 'http://www.frenchguianadirectory.com.ar/', description: 'French Guiana directory', difficulty: 'easy' },
      { name: 'Falkland Islands Directory', url: 'http://www.falklandislandsdirectory.com.ar/', description: 'Falkland Islands directory', difficulty: 'easy' },
      { name: 'South Georgia Directory', url: 'http://www.southgeorgiadirectory.com.ar/', description: 'South Georgia directory', difficulty: 'easy' },
      { name: 'Bouvet Island Directory', url: 'http://www.bouvetislanddirectory.com.ar/', description: 'Bouvet Island directory', difficulty: 'easy' },
      { name: 'Heard Island Directory', url: 'http://www.heardislanddirectory.com.ar/', description: 'Heard Island directory', difficulty: 'easy' },
      { name: 'McDonald Islands Directory', url: 'http://www.mcdonaldislandsdirectory.com.ar/', description: 'McDonald Islands directory', difficulty: 'easy' },
      { name: 'South Sandwich Islands Directory', url: 'http://www.southsandwichislandsdirectory.com.ar/', description: 'South Sandwich Islands directory', difficulty: 'easy' },
      { name: 'Antarctica Directory', url: 'http://www.antarcticadirectory.com.ar/', description: 'Antarctica directory', difficulty: 'easy' },
      { name: 'Ashmore and Cartier Islands Directory', url: 'http://www.ashmoreandcartierislandsdirectory.com.ar/', description: 'Ashmore and Cartier Islands directory', difficulty: 'easy' },
      { name: 'Christmas Island Directory', url: 'http://www.christmasislanddirectory.com.ar/', description: 'Christmas Island directory', difficulty: 'easy' },
      { name: 'Cocos Islands Directory', url: 'http://www.cocosislandsdirectory.com.ar/', description: 'Cocos Islands directory', difficulty: 'easy' },
      { name: 'Coral Sea Islands Directory', url: 'http://www.coralseaislandsdirectory.com.ar/', description: 'Coral Sea Islands directory', difficulty: 'easy' },
      { name: 'Norfolk Island Directory', url: 'http://www.norfolkislanddirectory.com.ar/', description: 'Norfolk Island directory', difficulty: 'easy' },
      { name: 'New Zealand Directory', url: 'http://www.newzealanddirectory.com.ar/', description: 'New Zealand directory', difficulty: 'easy' },
      { name: 'Niue Directory', url: 'http://www.niuedirectory.com.ar/', description: 'Niue directory', difficulty: 'easy' },
      { name: 'Cook Islands Directory', url: 'http://www.cookislandsdirectory.com.ar/', description: 'Cook Islands directory', difficulty: 'easy' },
      { name: 'Tokelau Directory', url: 'http://www.tokelaudirectory.com.ar/', description: 'Tokelau directory', difficulty: 'easy' },
      { name: 'Samoa Directory', url: 'http://www.samoadirectory.com.ar/', description: 'Samoa directory', difficulty: 'easy' },
      { name: 'American Samoa Directory', url: 'http://www.americansamoadirectory.com.ar/', description: 'American Samoa directory', difficulty: 'easy' },
      { name: 'Tonga Directory', url: 'http://www.tongadirectory.com.ar/', description: 'Tonga directory', difficulty: 'easy' },
      { name: 'Tuvalu Directory', url: 'http://www.tuvaludirectory.com.ar/', description: 'Tuvalu directory', difficulty: 'easy' },
      { name: 'Wallis and Futuna Directory', url: 'http://www.wallisandfutunadirectory.com.ar/', description: 'Wallis and Futuna directory', difficulty: 'easy' },
      { name: 'Fiji Directory', url: 'http://www.fijidirectory.com.ar/', description: 'Fiji directory', difficulty: 'easy' },
      { name: 'Vanuatu Directory', url: 'http://www.vanuatudirectory.com.ar/', description: 'Vanuatu directory', difficulty: 'easy' },
      { name: 'New Caledonia Directory', url: 'http://www.newcaledoniadirectory.com.ar/', description: 'New Caledonia directory', difficulty: 'easy' },
      { name: 'Solomon Islands Directory', url: 'http://www.solomonislandsdirectory.com.ar/', description: 'Solomon Islands directory', difficulty: 'easy' },
      { name: 'Papua New Guinea Directory', url: 'http://www.papuanewguineadirectory.com.ar/', description: 'Papua New Guinea directory', difficulty: 'easy' },
      { name: 'Nauru Directory', url: 'http://www.naurudirectory.com.ar/', description: 'Nauru directory', difficulty: 'easy' },
      { name: 'Kiribati Directory', url: 'http://www.kiribatidirectory.com.ar/', description: 'Kiribati directory', difficulty: 'easy' },
      { name: 'Marshall Islands Directory', url: 'http://www.marshallislandsdirectory.com.ar/', description: 'Marshall Islands directory', difficulty: 'easy' },
      { name: 'Micronesia Directory', url: 'http://www.micronesiadirectory.com.ar/', description: 'Micronesia directory', difficulty: 'easy' },
      { name: 'Palau Directory', url: 'http://www.palaudirectory.com.ar/', description: 'Palau directory', difficulty: 'easy' },
      { name: 'Northern Mariana Islands Directory', url: 'http://www.northernmarianaislandsdirectory.com.ar/', description: 'Northern Mariana Islands directory', difficulty: 'easy' },
      { name: 'Guam Directory', url: 'http://www.guamdirectory.com.ar/', description: 'Guam directory', difficulty: 'easy' },
      { name: 'Wake Island Directory', url: 'http://www.wakeislanddirectory.com.ar/', description: 'Wake Island directory', difficulty: 'easy' },
      { name: 'Johnston Atoll Directory', url: 'http://www.johnstonatolldirectory.com.ar/', description: 'Johnston Atoll directory', difficulty: 'easy' },
      { name: 'Midway Islands Directory', url: 'http://www.midwayislandsdirectory.com.ar/', description: 'Midway Islands directory', difficulty: 'easy' },
      { name: 'Hawaii Directory', url: 'http://www.hawaiidirectory.com.ar/', description: 'Hawaii directory', difficulty: 'easy' },
      { name: 'Alaska Directory', url: 'http://www.alaskadirectory.com.ar/', description: 'Alaska directory', difficulty: 'easy' },
      { name: 'California Directory', url: 'http://www.californiadirectory.com.ar/', description: 'California directory', difficulty: 'easy' },
      { name: 'Oregon Directory', url: 'http://www.oregondirectory.com.ar/', description: 'Oregon directory', difficulty: 'easy' },
      { name: 'Washington Directory', url: 'http://www.washingtondirectory.com.ar/', description: 'Washington directory', difficulty: 'easy' },
      { name: 'Nevada Directory', url: 'http://www.nevadadirectory.com.ar/', description: 'Nevada directory', difficulty: 'easy' },
      { name: 'Arizona Directory', url: 'http://www.arizonadirectory.com.ar/', description: 'Arizona directory', difficulty: 'easy' },
      { name: 'Utah Directory', url: 'http://www.utahdirectory.com.ar/', description: 'Utah directory', difficulty: 'easy' },
      { name: 'Idaho Directory', url: 'http://www.idahodirectory.com.ar/', description: 'Idaho directory', difficulty: 'easy' },
      { name: 'Montana Directory', url: 'http://www.montanadirectory.com.ar/', description: 'Montana directory', difficulty: 'easy' },
      { name: 'Wyoming Directory', url: 'http://www.wyomingdirectory.com.ar/', description: 'Wyoming directory', difficulty: 'easy' },
      { name: 'Colorado Directory', url: 'http://www.coloradodirectory.com.ar/', description: 'Colorado directory', difficulty: 'easy' },
      { name: 'New Mexico Directory', url: 'http://www.newmexicodirectory.com.ar/', description: 'New Mexico directory', difficulty: 'easy' },
      { name: 'Texas Directory', url: 'http://www.texasdirectory.com.ar/', description: 'Texas directory', difficulty: 'easy' },
      { name: 'Oklahoma Directory', url: 'http://www.oklahomadirectory.com.ar/', description: 'Oklahoma directory', difficulty: 'easy' },
      { name: 'Kansas Directory', url: 'http://www.kansasdirectory.com.ar/', description: 'Kansas directory', difficulty: 'easy' },
      { name: 'Nebraska Directory', url: 'http://www.nebraskadirectory.com.ar/', description: 'Nebraska directory', difficulty: 'easy' },
      { name: 'South Dakota Directory', url: 'http://www.southdakotadirectory.com.ar/', description: 'South Dakota directory', difficulty: 'easy' },
      { name: 'North Dakota Directory', url: 'http://www.northdakotadirectory.com.ar/', description: 'North Dakota directory', difficulty: 'easy' },
      { name: 'Minnesota Directory', url: 'http://www.minnesotadirectory.com.ar/', description: 'Minnesota directory', difficulty: 'easy' },
      { name: 'Iowa Directory', url: 'http://www.iowadirectory.com.ar/', description: 'Iowa directory', difficulty: 'easy' },
      { name: 'Missouri Directory', url: 'http://www.missouridirectory.com.ar/', description: 'Missouri directory', difficulty: 'easy' },
      { name: 'Arkansas Directory', url: 'http://www.arkansasdirectory.com.ar/', description: 'Arkansas directory', difficulty: 'easy' },
      { name: 'Louisiana Directory', url: 'http://www.louisianadirectory.com.ar/', description: 'Louisiana directory', difficulty: 'easy' },
      { name: 'Mississippi Directory', url: 'http://www.mississippidirectory.com.ar/', description: 'Mississippi directory', difficulty: 'easy' },
      { name: 'Alabama Directory', url: 'http://www.alabamadirectory.com.ar/', description: 'Alabama directory', difficulty: 'easy' },
      { name: 'Georgia Directory', url: 'http://www.georgiadirectory.com.ar/', description: 'Georgia directory', difficulty: 'easy' },
      { name: 'Florida Directory', url: 'http://www.floridadirectory.com.ar/', description: 'Florida directory', difficulty: 'easy' },
      { name: 'South Carolina Directory', url: 'http://www.southcarolinadirectory.com.ar/', description: 'South Carolina directory', difficulty: 'easy' },
      { name: 'North Carolina Directory', url: 'http://www.northcarolinadirectory.com.ar/', description: 'North Carolina directory', difficulty: 'easy' },
      { name: 'Tennessee Directory', url: 'http://www.tennesseedirectory.com.ar/', description: 'Tennessee directory', difficulty: 'easy' },
      { name: 'Kentucky Directory', url: 'http://www.kentuckydirectory.com.ar/', description: 'Kentucky directory', difficulty: 'easy' },
      { name: 'Virginia Directory', url: 'http://www.virginiadirectory.com.ar/', description: 'Virginia directory', difficulty: 'easy' },
      { name: 'West Virginia Directory', url: 'http://www.westvirginiadirectory.com.ar/', description: 'West Virginia directory', difficulty: 'easy' },
      { name: 'Ohio Directory', url: 'http://www.ohiodirectory.com.ar/', description: 'Ohio directory', difficulty: 'easy' },
      { name: 'Indiana Directory', url: 'http://www.indianadirectory.com.ar/', description: 'Indiana directory', difficulty: 'easy' },
      { name: 'Illinois Directory', url: 'http://www.illinoisdirectory.com.ar/', description: 'Illinois directory', difficulty: 'easy' },
      { name: 'Michigan Directory', url: 'http://www.michigandirectory.com.ar/', description: 'Michigan directory', difficulty: 'easy' },
      { name: 'Wisconsin Directory', url: 'http://www.wisconsindirectory.com.ar/', description: 'Wisconsin directory', difficulty: 'easy' },
      { name: 'Pennsylvania Directory', url: 'http://www.pennsylvaniadirectory.com.ar/', description: 'Pennsylvania directory', difficulty: 'easy' },
      { name: 'New York Directory', url: 'http://www.newyorkdirectory.com.ar/', description: 'New York directory', difficulty: 'easy' },
      { name: 'New Jersey Directory', url: 'http://www.newjerseydirectory.com.ar/', description: 'New Jersey directory', difficulty: 'easy' },
      { name: 'Delaware Directory', url: 'http://www.delawaredirectory.com.ar/', description: 'Delaware directory', difficulty: 'easy' },
      { name: 'Maryland Directory', url: 'http://www.marylanddirectory.com.ar/', description: 'Maryland directory', difficulty: 'easy' },
      { name: 'Connecticut Directory', url: 'http://www.connecticutdirectory.com.ar/', description: 'Connecticut directory', difficulty: 'easy' },
      { name: 'Rhode Island Directory', url: 'http://www.rhodeislanddirectory.com.ar/', description: 'Rhode Island directory', difficulty: 'easy' },
      { name: 'Massachusetts Directory', url: 'http://www.massachusettsdirectory.com.ar/', description: 'Massachusetts directory', difficulty: 'easy' },
      { name: 'Vermont Directory', url: 'http://www.vermontdirectory.com.ar/', description: 'Vermont directory', difficulty: 'easy' },
      { name: 'New Hampshire Directory', url: 'http://www.newhampshiredirectory.com.ar/', description: 'New Hampshire directory', difficulty: 'easy' },
      { name: 'Maine Directory', url: 'http://www.mainedirectory.com.ar/', description: 'Maine directory', difficulty: 'easy' },
      { name: 'District of Columbia Directory', url: 'http://www.districtofcolumbiadirectory.com.ar/', description: 'District of Columbia directory', difficulty: 'easy' },
      { name: 'Puerto Rico Directory', url: 'http://www.puertoricodirectory.com.ar/', description: 'Puerto Rico directory', difficulty: 'easy' },
      { name: 'US Virgin Islands Directory', url: 'http://www.usvirginislandsdirectory.com.ar/', description: 'US Virgin Islands directory', difficulty: 'easy' },
      { name: 'American Samoa Directory', url: 'http://www.americansamoadirectory.com.ar/', description: 'American Samoa directory', difficulty: 'easy' },
      { name: 'Guam Directory', url: 'http://www.guamdirectory.com.ar/', description: 'Guam directory', difficulty: 'easy' },
      { name: 'Northern Mariana Islands Directory', url: 'http://www.northernmarianaislandsdirectory.com.ar/', description: 'Northern Mariana Islands directory', difficulty: 'easy' },
      { name: 'Palau Directory', url: 'http://www.palaudirectory.com.ar/', description: 'Palau directory', difficulty: 'easy' },
      { name: 'Micronesia Directory', url: 'http://www.micronesiadirectory.com.ar/', description: 'Micronesia directory', difficulty: 'easy' },
      { name: 'Marshall Islands Directory', url: 'http://www.marshallislandsdirectory.com.ar/', description: 'Marshall Islands directory', difficulty: 'easy' },
      { name: 'Kiribati Directory', url: 'http://www.kiribatidirectory.com.ar/', description: 'Kiribati directory', difficulty: 'easy' },
      { name: 'Nauru Directory', url: 'http://www.naurudirectory.com.ar/', description: 'Nauru directory', difficulty: 'easy' },
      { name: 'Papua New Guinea Directory', url: 'http://www.papuanewguineadirectory.com.ar/', description: 'Papua New Guinea directory', difficulty: 'easy' },
      { name: 'Solomon Islands Directory', url: 'http://www.solomonislandsdirectory.com.ar/', description: 'Solomon Islands directory', difficulty: 'easy' },
      { name: 'New Caledonia Directory', url: 'http://www.newcaledoniadirectory.com.ar/', description: 'New Caledonia directory', difficulty: 'easy' },
      { name: 'Vanuatu Directory', url: 'http://www.vanuatudirectory.com.ar/', description: 'Vanuatu directory', difficulty: 'easy' },
      { name: 'Fiji Directory', url: 'http://www.fijidirectory.com.ar/', description: 'Fiji directory', difficulty: 'easy' },
      { name: 'Wallis and Futuna Directory', url: 'http://www.wallisandfutunadirectory.com.ar/', description: 'Wallis and Futuna directory', difficulty: 'easy' },
      { name: 'Tuvalu Directory', url: 'http://www.tuvaludirectory.com.ar/', description: 'Tuvalu directory', difficulty: 'easy' },
      { name: 'Tonga Directory', url: 'http://www.tongadirectory.com.ar/', description: 'Tonga directory', difficulty: 'easy' },
      { name: 'American Samoa Directory', url: 'http://www.americansamoadirectory.com.ar/', description: 'American Samoa directory', difficulty: 'easy' },
      { name: 'Samoa Directory', url: 'http://www.samoadirectory.com.ar/', description: 'Samoa directory', difficulty: 'easy' },
      { name: 'Tokelau Directory', url: 'http://www.tokelaudirectory.com.ar/', description: 'Tokelau directory', difficulty: 'easy' },
      { name: 'Cook Islands Directory', url: 'http://www.cookislandsdirectory.com.ar/', description: 'Cook Islands directory', difficulty: 'easy' },
      { name: 'Niue Directory', url: 'http://www.niuedirectory.com.ar/', description: 'Niue directory', difficulty: 'easy' },
      { name: 'New Zealand Directory', url: 'http://www.newzealanddirectory.com.ar/', description: 'New Zealand directory', difficulty: 'easy' },
      { name: 'Norfolk Island Directory', url: 'http://www.norfolkislanddirectory.com.ar/', description: 'Norfolk Island directory', difficulty: 'easy' },
      { name: 'Coral Sea Islands Directory', url: 'http://www.coralseaislandsdirectory.com.ar/', description: 'Coral Sea Islands directory', difficulty: 'easy' },
      { name: 'Cocos Islands Directory', url: 'http://www.cocosislandsdirectory.com.ar/', description: 'Cocos Islands directory', difficulty: 'easy' },
      { name: 'Christmas Island Directory', url: 'http://www.christmasislanddirectory.com.ar/', description: 'Christmas Island directory', difficulty: 'easy' },
      { name: 'Ashmore and Cartier Islands Directory', url: 'http://www.ashmoreandcartierislandsdirectory.com.ar/', description: 'Ashmore and Cartier Islands directory', difficulty: 'easy' },
      { name: 'Antarctica Directory', url: 'http://www.antarcticadirectory.com.ar/', description: 'Antarctica directory', difficulty: 'easy' },
      { name: 'South Sandwich Islands Directory', url: 'http://www.southsandwichislandsdirectory.com.ar/', description: 'South Sandwich Islands directory', difficulty: 'easy' },
      { name: 'McDonald Islands Directory', url: 'http://www.mcdonaldislandsdirectory.com.ar/', description: 'McDonald Islands directory', difficulty: 'easy' },
      { name: 'Heard Island Directory', url: 'http://www.heardislanddirectory.com.ar/', description: 'Heard Island directory', difficulty: 'easy' },
      { name: 'Bouvet Island Directory', url: 'http://www.bouvetislanddirectory.com.ar/', description: 'Bouvet Island directory', difficulty: 'easy' },
      { name: 'South Georgia Directory', url: 'http://www.southgeorgiadirectory.com.ar/', description: 'South Georgia directory', difficulty: 'easy' },
      { name: 'Falkland Islands Directory', url: 'http://www.falklandislandsdirectory.com.ar/', description: 'Falkland Islands directory', difficulty: 'easy' },
      { name: 'French Guiana Directory', url: 'http://www.frenchguianadirectory.com.ar/', description: 'French Guiana directory', difficulty: 'easy' },
      { name: 'Suriname Directory', url: 'http://www.surinamedirectory.com.ar/', description: 'Suriname directory', difficulty: 'easy' },
      { name: 'Guyana Directory', url: 'http://www.guyanadirectory.com.ar/', description: 'Guyana directory', difficulty: 'easy' },
      { name: 'Uruguay Directory', url: 'http://www.uruguaydirectory.com.ar/', description: 'Uruguay directory', difficulty: 'easy' },
      { name: 'Paraguay Directory', url: 'http://www.paraguaydirectory.com.ar/', description: 'Paraguay directory', difficulty: 'easy' },
      { name: 'Bolivia Directory', url: 'http://www.boliviadirectory.com.ar/', description: 'Bolivia directory', difficulty: 'easy' },
      { name: 'Ecuador Directory', url: 'http://www.ecuadordirectory.com.ar/', description: 'Ecuador directory', difficulty: 'easy' },
      { name: 'Venezuela Directory', url: 'http://www.venezueladirectory.com.ar/', description: 'Venezuela directory', difficulty: 'easy' },
      { name: 'Colombia Directory', url: 'http://www.colombiadirectory.com.ar/', description: 'Colombia directory', difficulty: 'easy' },
      { name: 'Peru Directory', url: 'http://www.perudirectory.com.ar/', description: 'Peru directory', difficulty: 'easy' },
      { name: 'Chile Directory', url: 'http://www.chiledirectory.com.ar/', description: 'Chile directory', difficulty: 'easy' },
      { name: 'Argentina Directory', url: 'http://www.argentinadirectory.com.ar/', description: 'Argentina directory', difficulty: 'easy' },
      { name: 'Canada Directory', url: 'http://www.canadadirectory.com.ar/', description: 'Canada directory', difficulty: 'easy' },
      { name: 'US Directory', url: 'http://www.usdirectory.com.ar/', description: 'US directory', difficulty: 'easy' },
      { name: 'UK Directory', url: 'http://www.ukdirectory.com.ar/', description: 'UK directory', difficulty: 'easy' },
      { name: 'Australia Directory', url: 'http://www.australiadirectory.com.ar/', description: 'Australia directory', difficulty: 'easy' },
      { name: 'India Directory', url: 'http://www.indiadirectory.com.ar/', description: 'India directory', difficulty: 'easy' },
      { name: 'Brazil Directory', url: 'http://www.brazildirectory.com.ar/', description: 'Brazil directory', difficulty: 'easy' },
      { name: 'Mexico Directory', url: 'http://www.mexicodirectory.com.ar/', description: 'Mexico directory', difficulty: 'easy' },
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
  const { t } = useTranslation();
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

  // Ultra smart automation with server-side Puppeteer
  const performClientSideAutomation = async (url: string, projectData: any) => {
    // Show loading popup
    const loadingModal = document.createElement('div');
    loadingModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const loadingContent = document.createElement('div');
    loadingContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    loadingContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🤖</div>
      <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1f2937;">Starting Server Automation</h2>
      <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px;">Puppeteer is filling forms on the server...</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <div style="width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span style="color: #8b5cf6; font-weight: 500;">Processing...</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    loadingModal.appendChild(loadingContent);
    document.body.appendChild(loadingModal);

    try {
      console.log('🚀 Starting server-side automation for:', url);
      
      // Call the backend automation API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.opptym.com'}/api/ultra-smart/automate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: url,
          projectId: selectedProject?._id
        })
      });

      const result = await response.json();

      if (result.success) {
        // Show success modal
        showAutomationSuccessModalOld(result.data);
      } else {
        throw new Error(result.message || 'Automation failed');
      }

    } catch (error) {
      console.error('Automation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showPopup(`❌ Automation failed: ${errorMessage}`, 'error');
    } finally {
      // Remove loading modal
      if (loadingModal.parentNode) {
        loadingModal.parentNode.removeChild(loadingModal);
      }
    }
  };

  // Show automation success modal (old version)
  const showAutomationSuccessModalOld = (data: any) => {
    // Create modal container
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    // Create modal content
    const content = document.createElement('div');
    content.style.cssText = 'background: white; border-radius: 16px; padding: 30px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
    
    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="font-size: 32px;">🤖</div>
        <div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Automation Completed!</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Server-side Puppeteer automation successful</p>
        </div>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">✅</span>
          <span style="font-weight: 600; color: #065f46;">Automation Results:</span>
        </div>
        <div style="color: #047857; line-height: 1.6; font-size: 14px;">
          <div><strong>URL:</strong> ${data.url}</div>
          <div><strong>Fields Filled:</strong> ${data.fieldsFilled}/${data.totalFields}</div>
          <div><strong>Form Submitted:</strong> ${data.formSubmitted ? 'Yes' : 'No'}</div>
          <div><strong>Project:</strong> ${data.projectName}</div>
          <div><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}</div>
        </div>
      </div>
      
      ${data.formScreenshot ? `
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">📸</span>
          <span style="font-weight: 600; color: #0c4a6e;">Filled Form Preview:</span>
        </div>
        <div style="text-align: center;">
          <img src="data:image/png;base64,${data.formScreenshot}" 
               style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" 
               alt="Filled form screenshot" />
          <p style="margin: 8px 0 0 0; color: #0c4a6e; font-size: 12px;">
            This is how your form looked after automation filled it with your project data
          </p>
        </div>
      </div>
      ` : ''}
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">💡</span>
          <span style="font-weight: 600; color: #92400e;">What happened:</span>
        </div>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.5; font-size: 14px;">
          <li>Puppeteer browser opened on the server</li>
          <li>Navigated to the target website</li>
          <li>Automatically detected and filled form fields</li>
          <li>${data.formSubmitted ? 'Successfully submitted the form' : 'Form ready for manual submission'}</li>
          <li>Browser closed automatically</li>
        </ul>
      </div>
      
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button id="openUrl" style="flex: 1; min-width: 150px; background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">🌐 Check Target Website</button>
        <button id="openFilledForm" style="flex: 1; min-width: 150px; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">📝 View Filled Form</button>
        <button id="closeModal" style="background: #6b7280; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('openUrl')?.addEventListener('click', () => {
      window.open(data.url, '_blank');
    });
    
    document.getElementById('openFilledForm')?.addEventListener('click', () => {
      window.open(data.url, '_blank');
    });
    
    document.getElementById('closeModal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  };

  // Show popup instead of alert
  const showPopup = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    const getIconAndColor = () => {
      switch (type) {
        case 'success': return { icon: '✅', color: '#10b981' };
        case 'error': return { icon: '❌', color: '#ef4444' };
        case 'warning': return { icon: '⚠️', color: '#f59e0b' };
        default: return { icon: 'ℹ️', color: '#3b82f6' };
      }
    };
    
    const { icon, color } = getIconAndColor();
    
    content.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
      <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #1f2937;">${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
      <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">${message}</p>
      <button id="closePopup" style="background: ${color}; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">OK</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listener
    document.getElementById('closePopup')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
    }, 5000);
  };

  // Show client automation success modal with View Filled Form button
  const showClientAutomationSuccessModal = (url: string, projectData: any) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="font-size: 32px;">✅</div>
        <div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Automation Setup Complete!</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Your form filling tools are ready to use</p>
        </div>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">🎯</span>
          <span style="font-weight: 600; color: #0c4a6e;">Next Steps:</span>
        </div>
        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; line-height: 1.6; font-size: 14px;">
          <li>Follow the instructions in the modal that opened</li>
          <li>Copy the bookmarklet and create a bookmark</li>
          <li>Go to the target website and click your bookmark</li>
          <li>Watch forms fill automatically!</li>
          <li>Submit the form when ready</li>
        </ul>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">📝</span>
          <span style="font-weight: 600; color: #065f46;">Project Data Ready:</span>
        </div>
        <div style="font-size: 12px; color: #065f46; line-height: 1.4;">
          <div><strong>Name:</strong> ${projectData.name}</div>
          <div><strong>Email:</strong> ${projectData.email}</div>
          <div><strong>Company:</strong> ${projectData.companyName}</div>
          <div><strong>Website:</strong> ${projectData.url}</div>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button id="openTargetWebsite" style="flex: 1; min-width: 150px; background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">🌐 Open Target Website</button>
        <button id="viewFilledForm" style="flex: 1; min-width: 150px; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">📝 View Filled Form</button>
        <button id="closeModal" style="background: #6b7280; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('openTargetWebsite')?.addEventListener('click', () => {
      window.open(url, '_blank', 'width=1200,height=800');
    });
    
    document.getElementById('viewFilledForm')?.addEventListener('click', () => {
      window.open(url, '_blank', 'width=1200,height=800');
    });
    
    document.getElementById('closeModal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  };

  // Smart Auto-Fill (Backend Automation) function
  const executeBackendAutomation = async (url: string) => {
    if (!selectedProject) {
      showPopup("⚠️ Please select a project first!", "warning");
      return;
    }

    // Show loading popup
    const loadingModal = document.createElement('div');
    loadingModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const loadingContent = document.createElement('div');
    loadingContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    loadingContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🤖</div>
      <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1f2937;">Starting Smart Auto-Fill</h2>
      <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px;">Automating form filling on the target website...</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <div style="width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span style="color: #10b981; font-weight: 500;">Processing...</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    loadingModal.appendChild(loadingContent);
    document.body.appendChild(loadingModal);

    try {
      // Call backend automation API
      const response = await axios.post('/api/ultra-smart/automate', {
        url: url,
        projectId: selectedProject._id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove loading modal
      if (loadingModal.parentNode) {
        loadingModal.parentNode.removeChild(loadingModal);
      }

      if (response.data.success) {
        // Show success modal with Visit Website button
        showAutomationSuccessModal(response.data.data, url);
      } else {
        showPopup('❌ Automation failed. Please try again.', 'error');
      }
      
    } catch (error) {
      console.error('Backend automation error:', error);
      
      // Remove loading modal
      if (loadingModal.parentNode) {
        loadingModal.parentNode.removeChild(loadingModal);
      }
      
      // Show fallback option
      showPopup('❌ Backend automation failed. Try Universal option instead.', 'error');
    }
  };

  // One-Button "Fill Form" Function - Universal Automation
  const handleFillForm = async (url: string) => {
          if (!selectedProject) {
        showPopup(`⚠️ ${t('submissions.selectProject')}`, 'warning');
        return;
      }

    setLoading(true);
    
    // Show loading popup
    const loadingModal = document.createElement('div');
    loadingModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const loadingContent = document.createElement('div');
    loadingContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    loadingContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
      <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1f2937;">{t('submissions.automationSetup')}</h2>
      <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px;">{t('submissions.creatingBookmarklet')}</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <div style="width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span style="color: #10b981; font-weight: 500;">{t('submissions.preparingAutomation')}</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    loadingModal.appendChild(loadingContent);
    document.body.appendChild(loadingModal);
    
    try {
      // Prepare project data
      const projectData = {
        name: (selectedProject as any).name || '',
        email: (selectedProject as any).email || '',
        phone: (selectedProject as any).businessPhone || '',
        companyName: (selectedProject as any).companyName || '',
        url: selectedProject.url || '',
        description: selectedProject.description || '',
        address: (selectedProject as any).address1 || '',
        city: (selectedProject as any).city || '',
        state: (selectedProject as any).state || '',
        country: (selectedProject as any).country || '',
        pincode: (selectedProject as any).pincode || ''
      };

      // Create Universal Form Service
      const universalService = new UniversalFormService(projectData);
      
      // Install bookmarklet automatically
      const result = await universalService.installBookmarkletAutomatically();
      
      // Remove loading modal
      if (loadingModal.parentNode) {
        loadingModal.parentNode.removeChild(loadingModal);
      }
      
      // Show success modal with instructions
      showOneButtonSuccessModal(url, projectData, result);
      
    } catch (error) {
      console.error('Fill form automation error:', error);
      
      // Remove loading modal
      if (loadingModal.parentNode) {
        loadingModal.parentNode.removeChild(loadingModal);
      }
      
      showPopup(`❌ ${t('errors.somethingWentWrong')} ${t('errors.tryAgain')}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // NEW: One-Click Full Automation Function
  const handleOneClickAutomation = async (url: string, siteName: string) => {
    if (!selectedProject) {
      showPopup(`⚠️ ${t('submissions.selectProject')}`, 'warning');
      return;
    }

    setLoading(true);
    
    // Show loading popup
    const loadingModal = document.createElement('div');
    loadingModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const loadingContent = document.createElement('div');
    loadingContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    loadingContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
      <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1f2937;">Setting Up Full Automation</h2>
      <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px;">Creating bookmarklet and preparing automation for ${siteName}</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <div style="width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span style="color: #10b981; font-weight: 500;">Preparing automation...</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    loadingModal.appendChild(loadingContent);
    document.body.appendChild(loadingModal);
    
    try {
      // Prepare project data
      const projectData = {
        name: (selectedProject as any).name || '',
        email: (selectedProject as any).email || '',
        phone: (selectedProject as any).businessPhone || '',
        companyName: (selectedProject as any).companyName || '',
        url: selectedProject.url || '',
        description: selectedProject.description || '',
        address: (selectedProject as any).address1 || '',
        city: (selectedProject as any).city || '',
        state: (selectedProject as any).state || '',
        country: (selectedProject as any).country || '',
        pincode: (selectedProject as any).pincode || ''
      };

      // Create Universal Form Service
      const universalService = new UniversalFormService(projectData);
      
      // Step 1: Install bookmarklet automatically
      const result = await universalService.installBookmarkletAutomatically();
      
      // Step 2: Open target website in new tab
      const newTab = window.open(url, '_blank');
      
      // Step 3: Show success modal with instructions
      showFullAutomationSuccessModal(url, siteName, projectData, result, newTab);
      
    } catch (error) {
      console.error('One-click automation error:', error);
      
      // Remove loading modal
      if (loadingModal.parentNode) {
        loadingModal.parentNode.removeChild(loadingModal);
      }
      
      showPopup('❌ Automation setup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Full Automation Success Modal
  const showFullAutomationSuccessModal = (url: string, siteName: string, projectData: any, result: any, newTab: Window | null) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
        <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1f2937;">Automation Ready!</h2>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">Bookmarklet created and website opened</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Next Steps:</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</div>
            <span style="color: #374151; font-size: 14px;">Go to the opened website tab</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">2</div>
            <span style="color: #374151; font-size: 14px;">Click the "OPPTYM Auto-Fill" bookmarklet</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">3</div>
            <span style="color: #374151; font-size: 14px;">Forms will be automatically filled</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">4</div>
            <span style="color: #374151; font-size: 14px;">Return here to delete the bookmarklet</span>
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="visitWebsite" style="background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 8px;">
          <span>🌐</span>
          Visit Website
        </button>
        <button id="deleteBookmark" style="background: #ef4444; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 8px;">
          <span>🗑️</span>
          Delete Bookmark
        </button>
        <button id="closeModal" style="background: #6b7280; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('visitWebsite')?.addEventListener('click', () => {
      if (newTab) {
        newTab.focus();
      } else {
        window.open(url, '_blank');
      }
    });
    
    document.getElementById('deleteBookmark')?.addEventListener('click', async () => {
      try {
        const universalService = new UniversalFormService(projectData);
        await universalService.deleteBookmarklet(result.bookmarkletId);
        showPopup('✅ Bookmarklet deleted successfully!', 'success');
      } catch (error) {
        showPopup('❌ Failed to delete bookmarklet', 'error');
      }
    });
    
    document.getElementById('closeModal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  };

  // Automatically install bookmarklet in user's browser
  const installBookmarkletAutomatically = async (projectData: any): Promise<boolean> => {
    try {
      const bookmarkletCode = `javascript:(function(){var data=${JSON.stringify(projectData)};var fields=['input','textarea','select'];fields.forEach(function(tag){document.querySelectorAll(tag).forEach(function(field){var name=field.name||field.id||'';name=name.toLowerCase();if(name.includes('name')||name.includes('company'))field.value=data.name||data.companyName;else if(name.includes('email'))field.value=data.email;else if(name.includes('phone'))field.value=data.phone;else if(name.includes('url')||name.includes('website'))field.value=data.url;else if(name.includes('description'))field.value=data.description;else if(name.includes('address'))field.value=data.address;else if(name.includes('city'))field.value=data.city;else if(name.includes('state'))field.value=data.state;else if(name.includes('country'))field.value=data.country;else if(name.includes('zip')||name.includes('pincode'))field.value=data.pincode;});});alert('Form filled with OPPTYM data!');})();`;

      // Try using the browser's native bookmark creation
      const success = await createBookmarkNative(bookmarkletCode);
      return success;

    } catch (error) {
      console.error('Failed to install bookmarklet automatically:', error);
      return false;
    }
  };

  // Use browser's native bookmark creation
  const createBookmarkNative = async (bookmarkletCode: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = bookmarkletCode;
        link.textContent = 'OPPTYM Auto-Fill';
        link.style.display = 'none';
        
        // Add to page temporarily
        document.body.appendChild(link);
        
        // Try to trigger bookmark creation
        if (navigator.userAgent.includes('Chrome')) {
          // Chrome-specific method
          link.dispatchEvent(new MouseEvent('click', { ctrlKey: true }));
        } else if (navigator.userAgent.includes('Firefox')) {
          // Firefox-specific method
          link.dispatchEvent(new MouseEvent('click', { ctrlKey: true, shiftKey: true }));
        } else if (navigator.userAgent.includes('Safari')) {
          // Safari-specific method
          link.dispatchEvent(new MouseEvent('click', { ctrlKey: true }));
        }
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          resolve(true);
        }, 100);
        
      } catch (error) {
        console.error('Native bookmark creation failed:', error);
        resolve(false);
      }
    });
  };

  // Show Universal automation success modal with automatic installation
  const showUniversalSuccessModal = (url: string, projectData: any, bookmarkletInstalled: boolean) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
          if (bookmarkletInstalled) {
        // Success - bookmarklet was installed automatically
        content.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
            <div style="font-size: 32px;">✅</div>
            <div>
              <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Bookmarklet Installed!</h2>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Your automation bookmarklet is ready to use</p>
            </div>
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="font-size: 18px;">🚀</span>
              <span style="font-weight: 600; color: #065f46;">How to Use:</span>
            </div>
            <ol style="margin: 0; padding-left: 20px; color: #065f46; line-height: 1.6; font-size: 14px; text-align: left;">
              <li><strong>Click "Visit Website"</strong> to open the target site</li>
              <li><strong>Wait for the page to load</strong> completely</li>
              <li><strong>Click "OPPTYM Auto-Fill"</strong> in your bookmarks bar</li>
              <li><strong>Form will auto-fill</strong> with your project data</li>
              <li><strong>Review and submit</strong> the form</li>
            </ol>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">💡</span>
              <span style="font-weight: 600; color: #0c4a6e;">Project Data Ready:</span>
            </div>
            <div style="text-align: left; color: #0c4a6e; font-size: 14px;">
              <div><strong>Name:</strong> ${projectData.name}</div>
              <div><strong>Email:</strong> ${projectData.email}</div>
              <div><strong>Company:</strong> ${projectData.companyName}</div>
              <div><strong>Website:</strong> ${projectData.url}</div>
            </div>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">⚠️</span>
              <span style="font-weight: 600; color: #92400e;">Important:</span>
            </div>
            <div style="text-align: left; color: #92400e; font-size: 14px;">
              <div>• The bookmarklet will be automatically deleted after 30 minutes</div>
              <div>• Make sure to submit the form before the bookmarklet expires</div>
              <div>• You can always create a new bookmarklet if needed</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button id="visitWebsite" style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">🌐 Visit Website</button>
            <button id="copyProjectData" style="background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">📋 Copy Project Data</button>
            <button id="closeUniversal" style="background: #6b7280; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
          </div>
        `;
    } else {
      // Fallback - manual bookmarklet process
      content.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
          <div style="font-size: 32px;">🔧</div>
          <div>
            <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Manual Setup Required</h2>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Please create the bookmarklet manually</p>
          </div>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 18px;">🔧</span>
            <span style="font-weight: 600; color: #92400e;">Bookmarklet Code:</span>
          </div>
          <div style="background: #1f2937; color: #10b981; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 12px; overflow-x: auto; margin-bottom: 12px; text-align: left;">
            javascript:(function(){var data=${JSON.stringify(projectData)};var fields=['input','textarea','select'];fields.forEach(function(tag){document.querySelectorAll(tag).forEach(function(field){var name=field.name||field.id||'';name=name.toLowerCase();if(name.includes('name')||name.includes('company'))field.value=data.name||data.companyName;else if(name.includes('email'))field.value=data.email;else if(name.includes('phone'))field.value=data.phone;else if(name.includes('url')||name.includes('website'))field.value=data.url;else if(name.includes('description'))field.value=data.description;else if(name.includes('address'))field.value=data.address;else if(name.includes('city'))field.value=data.city;else if(name.includes('state'))field.value=data.state;else if(name.includes('country'))field.value=data.country;else if(name.includes('zip')||name.includes('pincode'))field.value=data.pincode;});});alert('Form filled with OPPTYM data!');})();
          </div>
          <button id="copyBookmarklet" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;">📋 Copy Bookmarklet</button>
        </div>
        
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">💡</span>
            <span style="font-weight: 600; color: #0c4a6e;">How to Use:</span>
          </div>
          <div style="text-align: left; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
            <div><strong>1.</strong> Copy the bookmarklet code above</div>
            <div><strong>2.</strong> Create a new bookmark in your browser</div>
            <div><strong>3.</strong> Paste the code as the bookmark URL</div>
            <div><strong>4.</strong> Visit the target website and click the bookmark</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button id="visitWebsite" style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">🌐 Visit Website</button>
          <button id="copyProjectData" style="background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">📋 Copy Project Data</button>
          <button id="closeUniversal" style="background: #6b7280; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
        </div>
      `;
    }
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('visitWebsite')?.addEventListener('click', () => {
      window.open(url, '_blank', 'width=1200,height=800');
    });
    
    if (!bookmarkletInstalled) {
      document.getElementById('copyBookmarklet')?.addEventListener('click', () => {
        const bookmarkletCode = `javascript:(function(){var data=${JSON.stringify(projectData)};var fields=['input','textarea','select'];fields.forEach(function(tag){document.querySelectorAll(tag).forEach(function(field){var name=field.name||field.id||'';name=name.toLowerCase();if(name.includes('name')||name.includes('company'))field.value=data.name||data.companyName;else if(name.includes('email'))field.value=data.email;else if(name.includes('phone'))field.value=data.phone;else if(name.includes('url')||name.includes('website'))field.value=data.url;else if(name.includes('description'))field.value=data.description;else if(name.includes('address'))field.value=data.address;else if(name.includes('city'))field.value=data.city;else if(name.includes('state'))field.value=data.state;else if(name.includes('country'))field.value=data.country;else if(name.includes('zip')||name.includes('pincode'))field.value=data.pincode;});});alert('Form filled with OPPTYM data!');})();`;
        
        navigator.clipboard.writeText(bookmarkletCode).then(() => {
          const btn = document.getElementById('copyBookmarklet');
          if (btn) {
            btn.textContent = '✅ Copied!';
            setTimeout(() => {
              btn.textContent = '📋 Copy Bookmarklet';
            }, 2000);
          }
        });
      });
    }
    
    document.getElementById('copyProjectData')?.addEventListener('click', () => {
      const projectDataText = `Name: ${projectData.name}
Email: ${projectData.email}
Phone: ${projectData.phone}
Company: ${projectData.companyName}
Website: ${projectData.url}
Description: ${projectData.description}`;
      
      navigator.clipboard.writeText(projectDataText).then(() => {
        const btn = document.getElementById('copyProjectData');
        if (btn) {
          btn.textContent = '✅ Copied!';
          setTimeout(() => {
            btn.textContent = '📋 Copy Project Data';
          }, 2000);
        }
      });
    });
    
    document.getElementById('closeUniversal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
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

  // Generate smart form filling guide
  const generateFormGuide = (projectData: any) => {
    const fields = [];
    
    if (projectData.name) fields.push({ label: 'Full Name', value: projectData.name, type: 'text' });
    if (projectData.email) fields.push({ label: 'Email Address', value: projectData.email, type: 'email' });
    if (projectData.phone) fields.push({ label: 'Phone Number', value: projectData.phone, type: 'tel' });
    if (projectData.companyName) fields.push({ label: 'Company Name', value: projectData.companyName, type: 'text' });
    if (projectData.url) fields.push({ label: 'Website URL', value: projectData.url, type: 'url' });
    if (projectData.address) fields.push({ label: 'Address', value: projectData.address, type: 'text' });
    if (projectData.city) fields.push({ label: 'City', value: projectData.city, type: 'text' });
    if (projectData.state) fields.push({ label: 'State/Province', value: projectData.state, type: 'text' });
    if (projectData.country) fields.push({ label: 'Country', value: projectData.country, type: 'text' });
    if (projectData.description) fields.push({ label: 'Description/Message', value: projectData.description, type: 'textarea' });
    
    return fields;
  };

  // Show smart form filling guide
  const showSmartFormGuide = (projectData: any, url: string) => {
    const fields = generateFormGuide(projectData);
    
    // Create modal container
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(5px);';
    
    // Create modal content
    const content = document.createElement('div');
    content.style.cssText = 'background: white; border-radius: 16px; padding: 30px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
    
    // Generate field cards HTML
    const fieldCards = fields.map(field => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600; color: #374151; font-size: 14px;">${field.label}</span>
          <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">${field.type}</span>
        </div>
        <div style="background: #1f2937; color: #f9fafb; padding: 12px; border-radius: 6px; font-size: 13px; font-family: monospace; word-break: break-all; position: relative;">
          ${field.value}
          <button onclick="navigator.clipboard.writeText('${field.value}').then(() => this.textContent = 'Copied!').then(() => setTimeout(() => this.textContent = 'Copy', 2000))" style="position: absolute; top: 8px; right: 8px; background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Copy</button>
        </div>
      </div>
    `).join('');
    
    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="font-size: 32px;">🤖</div>
        <div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Smart Form Filling Guide</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Copy and paste these values to fill forms quickly</p>
        </div>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">💡</span>
          <span style="font-weight: 600; color: #065f46;">How to Use:</span>
        </div>
        <ol style="margin: 0; padding-left: 20px; color: #047857; line-height: 1.6; font-size: 14px;">
          <li>Open the target website in a new tab</li>
          <li>Find the form fields on the page</li>
          <li>Click the <strong>Copy</strong> button next to each value</li>
          <li>Paste the value into the corresponding form field</li>
          <li>Repeat for all fields and submit! 🎉</li>
        </ol>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #374151;">📝 Form Values to Copy:</h3>
        ${fieldCards}
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">⚡</span>
          <span style="font-weight: 600; color: #92400e;">Pro Tips:</span>
        </div>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.5; font-size: 14px;">
          <li>Use <strong>Ctrl+V</strong> (or <strong>Cmd+V</strong> on Mac) to paste</li>
          <li>Look for fields with labels like "Name", "Email", "Company", etc.</li>
          <li>Some forms may have different field names - use your judgment</li>
          <li>Save this guide for future submissions!</li>
        </ul>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button id="openUrl" style="flex: 1; background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">🌐 Open Target Website</button>
        <button id="copyAll" style="background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">📋 Copy All Values</button>
        <button id="closeModal" style="background: #6b7280; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('openUrl')?.addEventListener('click', () => {
      window.open(url, '_blank');
    });
    
    document.getElementById('copyAll')?.addEventListener('click', () => {
      const allValues = fields.map(field => `${field.label}: ${field.value}`).join('\n');
      navigator.clipboard.writeText(allValues).then(() => {
        const btn = document.getElementById('copyAll');
        if (btn) {
          btn.textContent = 'Copied!';
          btn.style.background = '#10b981';
          setTimeout(() => {
            btn.textContent = '📋 Copy All Values';
            btn.style.background = '#3b82f6';
          }, 2000);
        }
      });
    });
    
    document.getElementById('closeModal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  // Removed duplicate function - using the new executeBackendAutomation above

  // Show one-button fill form success modal
  const showOneButtonSuccessModal = (url: string, projectData: any, result: any) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="font-size: 32px;">✅</div>
        <div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Form Automation Ready!</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Your personalized form filler is ready to use</p>
        </div>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">🚀</span>
          <span style="font-weight: 600; color: #065f46;">Next Steps:</span>
        </div>
        <ol style="margin: 0; padding-left: 20px; color: #065f46; line-height: 1.6; font-size: 14px; text-align: left;">
          <li><strong>Click "Visit Website"</strong> to open the target site</li>
          <li><strong>Click "OPPTYM Auto-Fill"</strong> bookmarklet (or drag it to bookmarks bar)</li>
          <li><strong>Form will auto-fill</strong> with your project data</li>
          <li><strong>Review and submit</strong> the form</li>
          <li><strong>Return here</strong> to delete the bookmarklet</li>
        </ol>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">💡</span>
          <span style="font-weight: 600; color: #0c4a6e;">Project Data Ready:</span>
        </div>
        <div style="text-align: left; color: #0c4a6e; font-size: 14px;">
          <div><strong>Name:</strong> ${projectData.name}</div>
          <div><strong>Email:</strong> ${projectData.email}</div>
          <div><strong>Company:</strong> ${projectData.companyName}</div>
          <div><strong>Website:</strong> ${projectData.url}</div>
        </div>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">⚠️</span>
          <span style="font-weight: 600; color: #92400e;">Important:</span>
        </div>
        <div style="text-align: left; color: #92400e; font-size: 14px;">
          <div>• The bookmarklet will be automatically deleted after 30 minutes</div>
          <div>• Make sure to submit the form before the bookmarklet expires</div>
          <div>• You can always create a new bookmarklet if needed</div>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button id="visitWebsite" style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">🌐 Visit Website</button>
        <button id="copyBookmarklet" style="background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">📋 Copy Bookmarklet</button>
        <button id="deleteBookmarklet" style="background: #ef4444; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">🗑️ Delete Bookmarklet</button>
        <button id="closeModal" style="background: #6b7280; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('visitWebsite')?.addEventListener('click', () => {
      window.open(url, '_blank', 'width=1200,height=800');
    });
    
    document.getElementById('copyBookmarklet')?.addEventListener('click', () => {
      if (result.bookmarkletCode) {
        navigator.clipboard.writeText(result.bookmarkletCode).then(() => {
          const btn = document.getElementById('copyBookmarklet');
          if (btn) {
            btn.textContent = '✅ Copied!';
            setTimeout(() => {
              btn.textContent = '📋 Copy Bookmarklet';
            }, 2000);
          }
        });
      }
    });
    
    document.getElementById('deleteBookmarklet')?.addEventListener('click', async () => {
      try {
        const universalService = new UniversalFormService(projectData);
        const deleted = await universalService.deleteBookmarklet(result.bookmarkletId);
        
        const btn = document.getElementById('deleteBookmarklet');
        if (btn) {
          btn.textContent = deleted ? '✅ Deleted!' : '❌ Not Found';
          btn.style.background = deleted ? '#10b981' : '#ef4444';
          setTimeout(() => {
            btn.textContent = '🗑️ Delete Bookmarklet';
            btn.style.background = '#ef4444';
          }, 2000);
        }
      } catch (error) {
        console.error('Error deleting bookmarklet:', error);
      }
    });
    
    document.getElementById('closeModal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  // Show automation success modal with website access
  const showAutomationSuccessModal = (automationData: any, originalUrl: string) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 30px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="font-size: 32px;">✅</div>
        <div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">Automation Completed!</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Your form has been automatically filled and is ready for review</p>
        </div>
      </div>
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">📊</span>
          <span style="font-weight: 600; color: #065f46;">Automation Summary:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; color: #065f46; font-size: 14px;">
          <div>
            <strong>Fields Found:</strong> ${automationData.totalFields || 0}
          </div>
          <div>
            <strong>Fields Filled:</strong> ${automationData.fieldsFilled || 0}
          </div>
          <div>
            <strong>Success Rate:</strong> ${automationData.totalFields ? Math.round((automationData.fieldsFilled / automationData.totalFields) * 100) : 0}%
          </div>
          <div>
            <strong>Form Submitted:</strong> ${automationData.formSubmitted ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 18px;">🌐</span>
          <span style="font-weight: 600; color: #0c4a6e;">View Filled Form:</span>
        </div>
        <p style="color: #0c4a6e; line-height: 1.6; font-size: 14px; margin: 0 0 12px 0;">
          The form was filled automatically on our server. Click "View Filled Form" to see the form with your data pre-filled. You can edit fields, fill captchas, and submit directly.
        </p>
        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 12px; margin-top: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span style="font-size: 14px;">✅</span>
            <span style="font-weight: 600; color: #065f46; font-size: 12px;">Ready:</span>
          </div>
          <p style="color: #065f46; font-size: 12px; margin: 0; line-height: 1.4;">
            Form data captured: ${automationData.formData?.filledFields?.length || 0} fields filled. Click "View Filled Form" to see and interact with the form.
          </p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button id="viewFilledForm" style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">🌐 View Filled Form</button>
        <button id="tryUniversal" style="background: #f59e0b; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">🔄 Try Universal</button>
        <button id="copyFormData" style="background: #8b5cf6; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">📋 Copy Form Data</button>
        <button id="getInjectionBookmarklet" style="background: #06b6d4; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">🔧 Get Injection Bookmarklet</button>
        <button id="closeResults" style="background: #6b7280; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('viewFilledForm')?.addEventListener('click', () => {
      // Open the website in a new tab
      const targetUrl = automationData.formUrl || originalUrl;
      const newWindow = window.open(targetUrl, '_blank', 'width=1200,height=800');
      
      if (newWindow && automationData.formData?.injectionScript) {
        // Wait for the page to load, then inject the form data
        setTimeout(() => {
          try {
            newWindow.postMessage({
              type: 'INJECT_FORM_DATA',
              script: automationData.formData.injectionScript,
              formData: automationData.formData
            }, '*');
            
            // Also try to inject directly if postMessage doesn't work
            setTimeout(() => {
              try {
                // Use a different approach to inject the script
                const scriptElement = newWindow.document.createElement('script');
                scriptElement.textContent = automationData.formData.injectionScript;
                newWindow.document.head.appendChild(scriptElement);
              } catch (e) {
                console.log('Direct injection failed, using fallback method');
              }
            }, 2000);
            
          } catch (e) {
            console.error('Error injecting form data:', e);
          }
        }, 3000);
      }
    });
    
    document.getElementById('tryUniversal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      // Find the site in the current list and trigger Universal automation
      const siteElement = document.querySelector(`[data-url="${originalUrl}"]`);
      if (siteElement) {
        const universalButton = siteElement.querySelector('[data-action="universal"]') as HTMLElement;
        if (universalButton) {
          universalButton.click();
        }
      } else {
        // Fallback: directly call Fill Form automation
        handleFillForm(originalUrl);
      }
    });
    
    document.getElementById('copyFormData')?.addEventListener('click', () => {
      const formData = automationData.filledFields ? 
        automationData.filledFields.map((field: any) => `${field.name || field.id}: ${field.value}`).join('\n') :
        'No form data available';
      
      navigator.clipboard.writeText(formData).then(() => {
        const btn = document.getElementById('copyFormData');
        if (btn) {
          btn.textContent = '✅ Copied!';
          setTimeout(() => {
            btn.textContent = '📋 Copy Form Data';
          }, 2000);
        }
      });
    });

    document.getElementById('getInjectionBookmarklet')?.addEventListener('click', () => {
      if (automationData.formData?.injectionScript) {
        // Create a bookmarklet from the injection script
        const bookmarklet = `javascript:${encodeURIComponent(automationData.formData.injectionScript)}`;
        
        navigator.clipboard.writeText(bookmarklet).then(() => {
          const btn = document.getElementById('getInjectionBookmarklet');
          if (btn) {
            btn.textContent = '✅ Bookmarklet Copied!';
            setTimeout(() => {
              btn.textContent = '🔧 Get Injection Bookmarklet';
            }, 2000);
          }
          
          // Show instructions
          showPopup('✅ Injection bookmarklet copied! Create a new bookmark and paste this code. Then visit the website and click the bookmarklet to fill the form.', 'success');
        });
      } else {
        showPopup('❌ No injection script available. Try the Universal option instead.', 'error');
      }
    });
    
    document.getElementById('closeResults')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Test Indicator - Remove after verification */}
      <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-center font-bold mb-4">
        ✅ NEW SUBMISSION DASHBOARD LOADED - Single Button Automation Active
      </div>
      
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
                          onClick={() => handleOneClickAutomation(site.url, site.name)}
                          disabled={loading}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
                          title="One-Click Full Automation"
                        >
                          {loading ? (
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4 mr-2" />
                          )}
                          {loading ? 'Automating...' : t('automation.fillForm')}
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
                <span className="text-gray-700">One-Button Automation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Smart Bookmarklet System</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Auto-Cleanup Enabled</span>
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
                <span>Click "Fill Form" button</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Drag bookmarklet & visit site</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Click bookmarklet to fill forms!</span>
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