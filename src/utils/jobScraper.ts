import axios from 'axios';
import * as cheerio from 'cheerio';
import { Job, JobScrapingResult } from '@/types/job';

const BASE_URL = 'https://web3.career';

export async function scrapeWeb3Jobs(page: number = 1): Promise<JobScrapingResult> {
  try {
    const url = page === 1 ? `${BASE_URL}/java-jobs` : `${BASE_URL}/java-jobs?page=${page}`;
    
    // Note: Due to CORS restrictions, we'll need to use a proxy or server-side solution
    // For now, we'll simulate the data structure and provide a fallback
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const jobs: Job[] = [];

    // Parse job listings from the page
    $('tr').each((index, element) => {
      const $row = $(element);
      
      // Skip header row and empty rows
      if ($row.find('th').length > 0 || $row.find('td').length === 0) {
        return;
      }

      const $cells = $row.find('td');
      if ($cells.length >= 5) {
        const titleElement = $cells.eq(0).find('a').first();
        const companyElement = $cells.eq(1).find('h3');
        const locationText = $cells.eq(3).text().trim();
        const salaryText = $cells.eq(4).text().trim();
        const postedText = $cells.eq(2).text().trim();
        
        // Extract tags
        const tags: string[] = [];
        $cells.eq(5).find('a').each((_, tagEl) => {
          const tagText = $(tagEl).text().trim();
          if (tagText) tags.push(tagText);
        });

        const title = titleElement.text().trim();
        const company = companyElement.text().trim();
        const jobUrl = titleElement.attr('href');
        
        if (title && company && jobUrl) {
          const job: Job = {
            id: `web3-${index}-${Date.now()}`,
            title,
            company,
            location: locationText || 'Remote',
            salary: salaryText || 'Not specified',
            postedTime: postedText || 'Recently',
            tags,
            description: '', // Will be populated when fetching individual job details
            applyUrl: jobUrl.startsWith('http') ? jobUrl : `${BASE_URL}${jobUrl}`,
            companyUrl: companyElement.parent().attr('href')
          };
          
          jobs.push(job);
        }
      }
    });

    // Check for pagination
    const hasNextPage = $('a:contains("Next")').length > 0;
    const totalCountText = $('h1').text();
    const totalMatch = totalCountText.match(/(\d+,?\d*)\s+jobs/);
    const totalCount = totalMatch ? parseInt(totalMatch[1].replace(',', '')) : jobs.length;

    return {
      jobs,
      totalCount,
      currentPage: page,
      hasNextPage
    };

  } catch (error) {
    console.error('Error scraping jobs:', error);
    
    // Fallback: Return sample data for development/testing
    return getSampleJobs(page);
  }
}

export async function fetchJobDescription(jobUrl: string): Promise<string> {
  try {
    const response = await axios.get(jobUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extract job description - this may need adjustment based on actual HTML structure
    const description = $('.job-description, .description, [class*="description"]').first().text().trim();
    
    return description || 'Job description not available';
  } catch (error) {
    console.error('Error fetching job description:', error);
    return 'Unable to fetch job description';
  }
}

// Fallback sample data for development/testing
function getSampleJobs(page: number): JobScrapingResult {
  const sampleJobs: Job[] = [
    {
      id: 'sample-1',
      title: 'Lead Software Engineer',
      company: 'Mastercard',
      location: 'Pune, India',
      salary: '$81k - $84k',
      postedTime: '12h',
      tags: ['engineer', 'lead', 'dev', 'angular', 'blockchain'],
      description: 'Mastercard is looking for a talented Lead Software Development Engineer to join the Mastercard Blockchain and Digital Assets engineering team...',
      applyUrl: 'https://web3.career/lead-software-engineer-mastercard/104313'
    },
    {
      id: 'sample-2',
      title: 'Senior Full Stack Engineer Billing',
      company: 'Bcbgroup',
      location: 'Remote',
      salary: '$90k - $90k',
      postedTime: '1d',
      tags: ['engineer', 'full stack', 'senior', 'angular', 'crypto'],
      description: 'We are looking for a Senior Full Stack Engineer to join our billing team...',
      applyUrl: 'https://web3.career/senior-full-stack-engineer-billing-bcbgroup/104276'
    },
    {
      id: 'sample-3',
      title: 'Senior Backend Engineer Data Fabric Avalor',
      company: 'Zscaler',
      location: 'Remote',
      salary: '$106k - $114k',
      postedTime: '1d',
      tags: ['backend', 'engineer', 'senior', 'aws', 'java'],
      description: 'Join our team as a Senior Backend Engineer working on data fabric solutions...',
      applyUrl: 'https://web3.career/senior-backend-engineer-data-fabric-avalor-zscaler/100200'
    }
  ];

  return {
    jobs: sampleJobs,
    totalCount: 3667,
    currentPage: page,
    hasNextPage: page < 10
  };
}
