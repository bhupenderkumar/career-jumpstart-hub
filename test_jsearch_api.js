// Test script to verify JSearch API integration
// Run with: node test_jsearch_api.js

import axios from 'axios';

const RAPIDAPI_KEY = '5SI1JZvt1XmshSllu0k7cFEQBxsPp1qBVJwjsnZBKp67cn6glb';

async function testJSearchAPI() {
  console.log('🔍 Testing JSearch API integration...\n');
  
  try {
    console.log('📡 Making request to JSearch API...');
    
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: 'javascript developer',
        page: 1,
        num_pages: 1,
        date_posted: 'today'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      timeout: 15000
    });

    console.log('✅ API Response received!');
    console.log('📊 Status:', response.status);
    console.log('📈 Data structure:', {
      hasData: !!response.data,
      hasJobs: !!(response.data && response.data.data),
      jobCount: response.data?.data?.length || 0,
      totalCount: response.data?.total_count || 0
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('\n🎉 SUCCESS! Found jobs:');
      
      response.data.data.slice(0, 3).forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.job_title || 'N/A'}`);
        console.log(`   Company: ${job.employer_name || 'N/A'}`);
        console.log(`   Location: ${job.job_city || 'N/A'}, ${job.job_state || job.job_country || 'N/A'}`);
        console.log(`   Salary: ${job.job_salary || 'Not specified'}`);
        console.log(`   Posted: ${job.job_posted_at_datetime_utc || 'N/A'}`);
        console.log(`   Apply: ${job.job_apply_link ? 'Available' : 'N/A'}`);
        console.log(`   LinkedIn: ${job.job_apply_link?.includes('linkedin.com') ? 'Yes' : 'No'}`);
      });

      console.log('\n✨ LinkedIn Alternative API is working perfectly!');
      console.log('🚀 You can now access LinkedIn job data legally through the JSearch API.');
      
    } else {
      console.log('⚠️  API responded but no jobs found for this search term.');
      console.log('💡 Try different search terms or check if there are jobs posted today.');
    }

  } catch (error) {
    console.error('❌ API Test Failed:');
    
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
      
      if (error.response.status === 403) {
        console.error('\n🔑 API Key Issue: Check if your RapidAPI key is valid and has access to JSearch API');
      } else if (error.response.status === 429) {
        console.error('\n⏰ Rate Limit: You\'ve exceeded the API rate limit. Wait a moment and try again.');
      }
    } else if (error.request) {
      console.error('🌐 Network Error: Could not reach the API');
    } else {
      console.error('⚙️  Error:', error.message);
    }
  }
}

// Test the estimated salary endpoint as well
async function testSalaryAPI() {
  console.log('\n💰 Testing Salary Estimation API...\n');
  
  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/estimated-salary', {
      params: {
        job_title: 'javascript developer',
        location: 'new york',
        location_type: 'ANY',
        years_of_experience: 'ALL'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      timeout: 10000
    });

    console.log('✅ Salary API Response received!');
    console.log('📊 Salary data:', {
      hasData: !!response.data,
      hasSalaryData: !!(response.data && response.data.data),
      salaryCount: response.data?.data?.length || 0
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const salaryData = response.data.data[0];
      console.log('\n💵 Salary Information:');
      console.log(`   Job Title: ${salaryData.job_title || 'N/A'}`);
      console.log(`   Location: ${salaryData.location || 'N/A'}`);
      console.log(`   Min Salary: $${salaryData.min_salary || 'N/A'}`);
      console.log(`   Max Salary: $${salaryData.max_salary || 'N/A'}`);
      console.log(`   Median Salary: $${salaryData.median_salary || 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ Salary API Test Failed:', error.response?.status || error.message);
  }
}

// Run the tests
async function runAllTests() {
  console.log('🧪 JSearch API Integration Test Suite');
  console.log('=====================================\n');
  
  await testJSearchAPI();
  await testSalaryAPI();
  
  console.log('\n🏁 Test Suite Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Open http://localhost:8081 in your browser');
  console.log('2. Go to the "LinkedIn API Test" tab');
  console.log('3. Click "Test API" to verify integration in the app');
  console.log('4. Try searching for different job types (javascript, python, react, etc.)');
}

runAllTests();
