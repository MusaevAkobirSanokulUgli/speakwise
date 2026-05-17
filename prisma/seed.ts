import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// DATA DEFINITIONS
// ============================================================

const LEVELS = [
  { name: "Beginner (A1)", slug: "beginner", order: 1, color: "#22C55E", description: "Basic vocabulary and simple personal questions. Perfect for those just starting their English speaking journey." },
  { name: "Elementary (A2)", slug: "elementary", order: 2, color: "#3B82F6", description: "Everyday vocabulary and straightforward questions about familiar topics and routines." },
  { name: "Pre-Intermediate (B1)", slug: "pre-intermediate", order: 3, color: "#8B5CF6", description: "Expanded vocabulary with opinion-based questions. Start expressing your ideas more clearly." },
  { name: "Intermediate (B2)", slug: "intermediate", order: 4, color: "#F59E0B", description: "Rich vocabulary with comparison and discussion questions. Build fluency and confidence." },
  { name: "Upper-Intermediate (C1)", slug: "upper-intermediate", order: 5, color: "#EF4444", description: "Advanced vocabulary with analytical questions. Develop sophisticated arguments and ideas." },
  { name: "Advanced (C2)", slug: "advanced", order: 6, color: "#EC4899", description: "Academic and nuanced vocabulary. Master complex discussions and abstract topics." },
  { name: "IELTS", slug: "ielts", order: 7, color: "#14B8A6", description: "IELTS-specific vocabulary and exam-style speaking questions for Parts 1, 2, and 3." },
];

const TOPICS = [
  { name: "Travel & Tourism", slug: "travel-tourism", icon: "✈️", order: 1, description: "Explore vocabulary about journeys, destinations, accommodation, and travel experiences." },
  { name: "Food & Cooking", slug: "food-cooking", icon: "🍳", order: 2, description: "Learn words related to cuisine, ingredients, cooking methods, and dining experiences." },
  { name: "Family & Relationships", slug: "family-relationships", icon: "👨‍👩‍👧‍👦", order: 3, description: "Vocabulary about family members, relationships, and social connections." },
  { name: "Education & Learning", slug: "education-learning", icon: "📖", order: 4, description: "Words related to schools, universities, studying, and lifelong learning." },
  { name: "Health & Fitness", slug: "health-fitness", icon: "💪", order: 5, description: "Vocabulary about wellbeing, exercise, nutrition, and healthy lifestyles." },
  { name: "Technology & Internet", slug: "technology-internet", icon: "💻", order: 6, description: "Modern vocabulary about gadgets, social media, apps, and digital life." },
  { name: "Environment & Nature", slug: "environment-nature", icon: "🌿", order: 7, description: "Words about climate, wildlife, conservation, and the natural world." },
  { name: "Work & Career", slug: "work-career", icon: "💼", order: 8, description: "Professional vocabulary about jobs, workplaces, and career development." },
  { name: "Hobbies & Leisure", slug: "hobbies-leisure", icon: "🎨", order: 9, description: "Vocabulary for free-time activities, interests, and recreational pursuits." },
  { name: "Sports & Games", slug: "sports-games", icon: "⚽", order: 10, description: "Words related to athletic activities, competitions, and popular games." },
  { name: "Shopping & Fashion", slug: "shopping-fashion", icon: "🛍️", order: 11, description: "Vocabulary about clothes, shopping habits, and consumer culture." },
  { name: "Music & Entertainment", slug: "music-entertainment", icon: "🎵", order: 12, description: "Words about music genres, concerts, performers, and entertainment." },
  { name: "Culture & Traditions", slug: "culture-traditions", icon: "🏛️", order: 13, description: "Vocabulary about customs, heritage, ceremonies, and cultural practices." },
  { name: "Home & Housing", slug: "home-housing", icon: "🏠", order: 14, description: "Words related to houses, apartments, furniture, and living spaces." },
  { name: "Transport & Commuting", slug: "transport-commuting", icon: "🚗", order: 15, description: "Vocabulary about vehicles, public transport, and daily commuting." },
  { name: "Weather & Seasons", slug: "weather-seasons", icon: "🌤️", order: 16, description: "Words about climate conditions, seasons, and weather phenomena." },
  { name: "Animals & Pets", slug: "animals-pets", icon: "🐾", order: 17, description: "Vocabulary about domestic pets, wild animals, and animal behavior." },
  { name: "Art & Creativity", slug: "art-creativity", icon: "🎭", order: 18, description: "Words related to visual arts, theater, creativity, and artistic expression." },
  { name: "Money & Finance", slug: "money-finance", icon: "💰", order: 19, description: "Vocabulary about banking, budgeting, investments, and financial literacy." },
  { name: "Social Media", slug: "social-media", icon: "📱", order: 20, description: "Modern vocabulary about online platforms, digital communication, and viral content." },
  { name: "Books & Reading", slug: "books-reading", icon: "📚", order: 21, description: "Words about literature, genres, authors, and the reading experience." },
  { name: "Movies & TV", slug: "movies-tv", icon: "🎬", order: 22, description: "Vocabulary about film, television, streaming, and visual storytelling." },
  { name: "Celebrations & Festivals", slug: "celebrations-festivals", icon: "🎉", order: 23, description: "Words about holidays, parties, ceremonies, and festive occasions." },
  { name: "City & Country Life", slug: "city-country-life", icon: "🏙️", order: 24, description: "Vocabulary comparing urban and rural living, neighborhoods, and communities." },
  { name: "Dreams & Ambitions", slug: "dreams-ambitions", icon: "🌟", order: 25, description: "Words about goals, aspirations, future plans, and personal growth." },
];

// Vocabulary data: [word, definition, example, pronunciation, partOfSpeech]
type VocabEntry = [string, string, string, string, string];

interface TopicVocab {
  beginner: VocabEntry[];
  intermediate: VocabEntry[];
  ielts: VocabEntry[];
}

const VOCABULARY: Record<string, TopicVocab> = {
  "travel-tourism": {
    beginner: [
      ["passport", "An official document for international travel", "I need my passport to fly to London.", "/ˈpæspɔːrt/", "noun"],
      ["luggage", "Bags and suitcases you take when traveling", "Please put your luggage on the belt.", "/ˈlʌɡɪdʒ/", "noun"],
      ["ticket", "A piece of paper that allows you to travel", "I bought a ticket for the train.", "/ˈtɪkɪt/", "noun"],
      ["hotel", "A building where people pay to stay", "We stayed at a nice hotel near the beach.", "/hoʊˈtɛl/", "noun"],
      ["airport", "A place where planes take off and land", "We arrived at the airport two hours early.", "/ˈɛrpɔːrt/", "noun"],
      ["tourist", "A person who visits places for fun", "The city is full of tourists in summer.", "/ˈtʊrɪst/", "noun"],
      ["map", "A drawing that shows roads and places", "Can you show me on the map?", "/mæp/", "noun"],
      ["beach", "An area of sand next to the sea", "We went swimming at the beach.", "/biːtʃ/", "noun"],
      ["camera", "A device for taking photographs", "I forgot my camera at the hotel.", "/ˈkæmərə/", "noun"],
      ["souvenir", "Something you buy to remember a trip", "I bought a souvenir for my mother.", "/ˌsuːvəˈnɪr/", "noun"],
    ],
    intermediate: [
      ["itinerary", "A planned route or schedule for a trip", "Our itinerary includes three cities in two weeks.", "/aɪˈtɪnərɛri/", "noun"],
      ["accommodation", "A place to stay during travel", "We need to book accommodation before we leave.", "/əˌkɒməˈdeɪʃən/", "noun"],
      ["destination", "The place where someone is going", "Paris is a popular tourist destination.", "/ˌdɛstɪˈneɪʃən/", "noun"],
      ["excursion", "A short trip for pleasure", "We went on an excursion to the mountains.", "/ɪkˈskɜːrʒən/", "noun"],
      ["departure", "The act of leaving a place", "Our departure is scheduled for 8 AM.", "/dɪˈpɑːrtʃər/", "noun"],
      ["reservation", "An arrangement to have something kept for you", "I made a reservation at the restaurant.", "/ˌrɛzərˈveɪʃən/", "noun"],
      ["currency", "The money system used in a country", "You need to exchange currency at the airport.", "/ˈkʌrənsi/", "noun"],
      ["sightseeing", "Visiting interesting places as a tourist", "We spent the day sightseeing in Rome.", "/ˈsaɪtˌsiːɪŋ/", "noun"],
      ["jet lag", "Tiredness after a long flight across time zones", "I always suffer from jet lag after flying to Asia.", "/ˈdʒɛt læɡ/", "noun"],
      ["backpacking", "Traveling cheaply with a backpack", "Backpacking through Europe was an amazing experience.", "/ˈbækˌpækɪŋ/", "noun"],
    ],
    ielts: [
      ["sustainable tourism", "Tourism that minimizes environmental impact", "The government promotes sustainable tourism to protect natural habitats.", "/səˈsteɪnəbl ˈtʊrɪzəm/", "noun"],
      ["cultural immersion", "Deep involvement in local culture while traveling", "Cultural immersion gives travelers a more authentic experience.", "/ˈkʌltʃərəl ɪˈmɜːrʒən/", "noun"],
      ["ecotourism", "Tourism focused on natural environments", "Ecotourism has grown rapidly in developing countries.", "/ˈiːkoʊˌtʊrɪzəm/", "noun"],
      ["hospitality", "The business of providing services to guests", "The hospitality industry employs millions worldwide.", "/ˌhɒspɪˈtælɪti/", "noun"],
      ["infrastructure", "Basic systems and services needed by a society", "Poor infrastructure discourages tourists from visiting.", "/ˈɪnfrəˌstrʌktʃər/", "noun"],
      ["off the beaten track", "Away from popular tourist routes", "We prefer traveling off the beaten track.", "/ɒf ðə ˈbiːtən træk/", "phrase"],
      ["cosmopolitan", "Having people and influences from many countries", "London is a truly cosmopolitan city.", "/ˌkɒzməˈpɒlɪtən/", "adjective"],
      ["heritage site", "A place of cultural or historical importance", "The temple is a UNESCO World Heritage site.", "/ˈhɛrɪtɪdʒ saɪt/", "noun"],
      ["pilgrim", "A person who travels to a sacred place", "Thousands of pilgrims visit Mecca each year.", "/ˈpɪlɡrɪm/", "noun"],
      ["wanderlust", "A strong desire to travel and explore", "Her wanderlust led her to visit over 50 countries.", "/ˈwɒndərlʌst/", "noun"],
    ],
  },
  "food-cooking": {
    beginner: [
      ["breakfast", "The first meal of the day", "I have eggs and toast for breakfast.", "/ˈbrɛkfəst/", "noun"],
      ["lunch", "A meal eaten in the middle of the day", "We had lunch at a cafe.", "/lʌntʃ/", "noun"],
      ["dinner", "The main meal of the day, usually in the evening", "What would you like for dinner tonight?", "/ˈdɪnər/", "noun"],
      ["recipe", "Instructions for preparing food", "Can you give me the recipe for this cake?", "/ˈrɛsɪpi/", "noun"],
      ["kitchen", "A room where food is prepared", "My mother spends a lot of time in the kitchen.", "/ˈkɪtʃɪn/", "noun"],
      ["delicious", "Having a very pleasant taste", "This soup is absolutely delicious!", "/dɪˈlɪʃəs/", "adjective"],
      ["hungry", "Wanting or needing food", "I'm very hungry. Let's eat!", "/ˈhʌŋɡri/", "adjective"],
      ["cook", "To prepare food using heat", "My father loves to cook Italian food.", "/kʊk/", "verb"],
      ["fry", "To cook food in hot oil", "Fry the onions until they are golden.", "/fraɪ/", "verb"],
      ["boil", "To heat water until it bubbles", "Boil the water before adding the pasta.", "/bɔɪl/", "verb"],
    ],
    intermediate: [
      ["cuisine", "A style of cooking from a particular country", "Thai cuisine is known for its spicy flavors.", "/kwɪˈziːn/", "noun"],
      ["appetizer", "A small dish served before the main course", "We ordered some appetizers while waiting.", "/ˈæpɪˌtaɪzər/", "noun"],
      ["ingredient", "Any of the foods used to make a particular dish", "What ingredients do I need for the recipe?", "/ɪnˈɡriːdiənt/", "noun"],
      ["portion", "The amount of food served to one person", "The portions at this restaurant are very generous.", "/ˈpɔːrʃən/", "noun"],
      ["seasoning", "Salt, pepper, or spices added to food", "Add some seasoning to improve the taste.", "/ˈsiːzənɪŋ/", "noun"],
      ["sauté", "To fry food quickly in a small amount of oil", "Sauté the vegetables for three minutes.", "/sɔːˈteɪ/", "verb"],
      ["marinate", "To soak food in a sauce before cooking", "Marinate the chicken overnight for best results.", "/ˈmærɪneɪt/", "verb"],
      ["nutritious", "Containing substances that help the body grow", "Vegetables are very nutritious.", "/njuːˈtrɪʃəs/", "adjective"],
      ["organic", "Produced without artificial chemicals", "We buy organic vegetables from the market.", "/ɔːrˈɡænɪk/", "adjective"],
      ["bland", "Having very little flavor", "The soup was too bland, so I added salt.", "/blænd/", "adjective"],
    ],
    ielts: [
      ["gastronomy", "The art and science of good eating", "French gastronomy is world-renowned.", "/ɡæˈstrɒnəmi/", "noun"],
      ["culinary", "Related to cooking or kitchens", "She enrolled in a culinary arts program.", "/ˈkʌlɪnəri/", "adjective"],
      ["food sustainability", "Producing food without harming the environment", "Food sustainability is a major global concern.", "/fuːd səˌsteɪnəˈbɪlɪti/", "noun"],
      ["genetically modified", "Food with altered DNA for desired traits", "The debate over genetically modified crops continues.", "/dʒəˈnɛtɪkli ˈmɒdɪfaɪd/", "adjective"],
      ["food security", "Having reliable access to sufficient food", "Climate change threatens food security in many regions.", "/fuːd sɪˈkjʊrɪti/", "noun"],
      ["malnutrition", "Poor health caused by insufficient nutrition", "Malnutrition affects millions of children worldwide.", "/ˌmælnjuːˈtrɪʃən/", "noun"],
      ["preservative", "A chemical substance added to prevent spoilage", "Many processed foods contain artificial preservatives.", "/prɪˈzɜːrvətɪv/", "noun"],
      ["dietary", "Related to a person's diet", "She has strict dietary requirements due to allergies.", "/ˈdaɪətəri/", "adjective"],
      ["palatable", "Pleasant to taste or acceptable", "The chef made the simple ingredients incredibly palatable.", "/ˈpælətəbl/", "adjective"],
      ["staple food", "A food that forms the basis of a diet", "Rice is a staple food in many Asian countries.", "/ˈsteɪpl fuːd/", "noun"],
    ],
  },
  "family-relationships": {
    beginner: [
      ["mother", "A female parent", "My mother is a teacher.", "/ˈmʌðər/", "noun"],
      ["father", "A male parent", "My father works in a bank.", "/ˈfɑːðər/", "noun"],
      ["brother", "A male sibling", "I have two brothers.", "/ˈbrʌðər/", "noun"],
      ["sister", "A female sibling", "My sister is older than me.", "/ˈsɪstər/", "noun"],
      ["parents", "Your mother and father", "My parents live in the city.", "/ˈpɛrənts/", "noun"],
      ["friend", "A person you like and enjoy being with", "She is my best friend.", "/frɛnd/", "noun"],
      ["husband", "A married man", "Her husband is a doctor.", "/ˈhʌzbənd/", "noun"],
      ["wife", "A married woman", "His wife works at a hospital.", "/waɪf/", "noun"],
      ["baby", "A very young child", "The baby is sleeping now.", "/ˈbeɪbi/", "noun"],
      ["grandparents", "The parents of your parents", "I visit my grandparents every weekend.", "/ˈɡrændˌpɛrənts/", "noun"],
    ],
    intermediate: [
      ["sibling", "A brother or sister", "I have three siblings — two brothers and a sister.", "/ˈsɪblɪŋ/", "noun"],
      ["relative", "A member of your family", "We invited all our relatives to the wedding.", "/ˈrɛlətɪv/", "noun"],
      ["upbringing", "The way a child is raised", "She had a strict upbringing.", "/ˈʌpˌbrɪŋɪŋ/", "noun"],
      ["bond", "A strong connection between people", "The bond between mother and child is very strong.", "/bɒnd/", "noun"],
      ["extended family", "Family beyond parents and siblings", "In my culture, extended family is very important.", "/ɪkˈstɛndɪd ˈfæmɪli/", "noun"],
      ["close-knit", "Having strong relationships within a group", "We are a very close-knit family.", "/kloʊs nɪt/", "adjective"],
      ["supportive", "Giving help and encouragement", "My parents are very supportive of my decisions.", "/səˈpɔːrtɪv/", "adjective"],
      ["resemble", "To look or be similar to someone", "She resembles her mother.", "/rɪˈzɛmbl/", "verb"],
      ["raise", "To care for children until they are adults", "It is not easy to raise children.", "/reɪz/", "verb"],
      ["get along", "To have a friendly relationship", "I get along well with my colleagues.", "/ɡɛt əˈlɒŋ/", "phrasal verb"],
    ],
    ielts: [
      ["nuclear family", "A family unit of parents and children", "The nuclear family has become smaller in modern societies.", "/ˈnjuːkliər ˈfæmɪli/", "noun"],
      ["dysfunctional", "Not operating normally or healthily", "He grew up in a dysfunctional family.", "/dɪsˈfʌŋkʃənəl/", "adjective"],
      ["generation gap", "Differences in attitudes between age groups", "The generation gap is widening due to technology.", "/ˌdʒɛnəˈreɪʃən ɡæp/", "noun"],
      ["unconditional", "Without any conditions or limits", "A parent's love should be unconditional.", "/ˌʌnkənˈdɪʃənəl/", "adjective"],
      ["hereditary", "Passed from parent to child genetically", "Some diseases are hereditary.", "/hɪˈrɛdɪtəri/", "adjective"],
      ["nurture", "To care for and encourage growth", "Parents must nurture their children's talents.", "/ˈnɜːrtʃər/", "verb"],
      ["estranged", "No longer close or affectionate", "She became estranged from her family.", "/ɪˈstreɪndʒd/", "adjective"],
      ["patriarchal", "Ruled or controlled by men", "Many traditional societies are patriarchal.", "/ˌpeɪtriˈɑːrkəl/", "adjective"],
      ["kinship", "The relationship between family members", "Kinship ties are strong in rural communities.", "/ˈkɪnʃɪp/", "noun"],
      ["breadwinner", "The main income earner in a family", "In many households, both parents are breadwinners.", "/ˈbrɛdˌwɪnər/", "noun"],
    ],
  },
};

// Generate vocabulary for remaining topics programmatically with real content
function getDefaultVocab(topicSlug: string): TopicVocab {
  const topicVocabs: Record<string, TopicVocab> = {
    "education-learning": {
      beginner: [
        ["school", "A place where children learn", "I go to school every day.", "/skuːl/", "noun"],
        ["teacher", "A person who teaches", "Our teacher is very kind.", "/ˈtiːtʃər/", "noun"],
        ["student", "A person who studies", "She is a good student.", "/ˈstjuːdənt/", "noun"],
        ["homework", "Work given to do at home", "I need to finish my homework.", "/ˈhoʊmˌwɜːrk/", "noun"],
        ["book", "Pages with printed words", "I read a book every week.", "/bʊk/", "noun"],
        ["exam", "A test of knowledge", "The exam was very difficult.", "/ɪɡˈzæm/", "noun"],
        ["classroom", "A room where lessons happen", "Our classroom has 30 desks.", "/ˈklæsˌruːm/", "noun"],
        ["learn", "To get knowledge or skill", "I want to learn English.", "/lɜːrn/", "verb"],
        ["write", "To put words on paper", "Please write your name here.", "/raɪt/", "verb"],
        ["read", "To look at words and understand them", "Can you read this sentence?", "/riːd/", "verb"],
      ],
      intermediate: [
        ["curriculum", "The subjects in a course of study", "The school updated its curriculum.", "/kəˈrɪkjələm/", "noun"],
        ["scholarship", "Money given to support a student's education", "She won a scholarship to study abroad.", "/ˈskɒlərʃɪp/", "noun"],
        ["semester", "Half of a school year", "The fall semester starts in September.", "/sɪˈmɛstər/", "noun"],
        ["lecture", "A talk given to a group of students", "The professor gave an interesting lecture.", "/ˈlɛktʃər/", "noun"],
        ["assignment", "A task given as part of studies", "The assignment is due on Friday.", "/əˈsaɪnmənt/", "noun"],
        ["graduate", "To complete a course of study", "She will graduate from university next year.", "/ˈɡrædʒuˌeɪt/", "verb"],
        ["tuition", "Money paid for education", "Tuition fees are increasing every year.", "/tjuˈɪʃən/", "noun"],
        ["discipline", "Controlled behavior or a field of study", "History is my favorite discipline.", "/ˈdɪsɪplɪn/", "noun"],
        ["plagiarism", "Copying someone else's work", "Plagiarism is a serious academic offense.", "/ˈpleɪdʒərɪzəm/", "noun"],
        ["extracurricular", "Activities outside the regular curriculum", "She participates in many extracurricular activities.", "/ˌɛkstrəkəˈrɪkjələr/", "adjective"],
      ],
      ielts: [
        ["pedagogical", "Related to teaching methods", "The school adopted new pedagogical approaches.", "/ˌpɛdəˈɡɒdʒɪkəl/", "adjective"],
        ["vocational", "Related to skills for a particular job", "Vocational training is essential for practical careers.", "/voʊˈkeɪʃənəl/", "adjective"],
        ["rote learning", "Learning by memorizing", "Rote learning is less effective than understanding concepts.", "/roʊt ˈlɜːrnɪŋ/", "noun"],
        ["literacy", "The ability to read and write", "Improving literacy rates is a global priority.", "/ˈlɪtərəsi/", "noun"],
        ["academia", "The world of universities and scholarship", "She has spent her career in academia.", "/ˌækəˈdiːmiə/", "noun"],
        ["cognitive", "Related to thinking and understanding", "Reading improves cognitive abilities.", "/ˈkɒɡnɪtɪv/", "adjective"],
        ["autodidact", "A self-taught person", "Leonardo da Vinci was a famous autodidact.", "/ˈɔːtoʊˌdaɪdækt/", "noun"],
        ["syllabus", "An outline of subjects in a course", "The syllabus covers 12 modules.", "/ˈsɪləbəs/", "noun"],
        ["dissertation", "A long essay for a university degree", "She is writing her dissertation on climate change.", "/ˌdɪsərˈteɪʃən/", "noun"],
        ["meritocracy", "A system where advancement is based on ability", "Education should promote meritocracy.", "/ˌmɛrɪˈtɒkrəsi/", "noun"],
      ],
    },
    "health-fitness": {
      beginner: [
        ["doctor", "A person who helps sick people", "I need to see a doctor.", "/ˈdɒktər/", "noun"],
        ["hospital", "A place where sick people get treatment", "She went to the hospital.", "/ˈhɒspɪtl/", "noun"],
        ["exercise", "Physical activity to stay healthy", "I exercise every morning.", "/ˈɛksərsaɪz/", "noun"],
        ["healthy", "In good physical condition", "Eating fruit is healthy.", "/ˈhɛlθi/", "adjective"],
        ["sick", "Not well, having an illness", "I feel sick today.", "/sɪk/", "adjective"],
        ["medicine", "A substance used to treat illness", "Take this medicine twice a day.", "/ˈmɛdɪsɪn/", "noun"],
        ["sleep", "To rest with eyes closed", "I sleep eight hours every night.", "/sliːp/", "verb"],
        ["walk", "To move on foot", "I walk to school every day.", "/wɔːk/", "verb"],
        ["run", "To move quickly on foot", "I run in the park every morning.", "/rʌn/", "verb"],
        ["water", "A clear liquid we drink", "Drink plenty of water every day.", "/ˈwɔːtər/", "noun"],
      ],
      intermediate: [
        ["nutrition", "The process of eating the right food for health", "Good nutrition is essential for growth.", "/njuːˈtrɪʃən/", "noun"],
        ["workout", "A session of physical exercise", "I had an intense workout at the gym.", "/ˈwɜːrkaʊt/", "noun"],
        ["stamina", "The ability to sustain physical effort", "Running builds stamina.", "/ˈstæmɪnə/", "noun"],
        ["supplement", "Something added to improve diet", "He takes vitamin supplements daily.", "/ˈsʌplɪmənt/", "noun"],
        ["obesity", "The condition of being very overweight", "Obesity is a growing health problem.", "/oʊˈbiːsɪti/", "noun"],
        ["therapy", "Treatment for illness or disability", "Physical therapy helped her recover.", "/ˈθɛrəpi/", "noun"],
        ["stress", "Mental or emotional strain", "Too much stress is bad for your health.", "/strɛs/", "noun"],
        ["immune system", "The body's defense against disease", "A healthy diet strengthens your immune system.", "/ɪˈmjuːn ˈsɪstəm/", "noun"],
        ["flexibility", "The ability to bend easily", "Yoga improves flexibility.", "/ˌflɛksɪˈbɪlɪti/", "noun"],
        ["addictive", "Causing a strong habit that is hard to stop", "Sugar can be addictive.", "/əˈdɪktɪv/", "adjective"],
      ],
      ielts: [
        ["sedentary", "Involving much sitting and little exercise", "A sedentary lifestyle increases health risks.", "/ˈsɛdənˌtɛri/", "adjective"],
        ["preventive", "Designed to stop something bad from happening", "Preventive medicine focuses on avoiding illness.", "/prɪˈvɛntɪv/", "adjective"],
        ["holistic", "Treating the whole person, not just symptoms", "She prefers holistic medicine.", "/hoʊˈlɪstɪk/", "adjective"],
        ["epidemic", "A widespread occurrence of a disease", "The obesity epidemic affects many countries.", "/ˌɛpɪˈdɛmɪk/", "noun"],
        ["rehabilitation", "Restoring someone to good health", "He underwent months of rehabilitation.", "/ˌriːəˌbɪlɪˈteɪʃən/", "noun"],
        ["life expectancy", "The average age a person can expect to live", "Life expectancy has increased significantly.", "/laɪf ɪkˈspɛktənsi/", "noun"],
        ["well-being", "The state of being comfortable and healthy", "Mental well-being is just as important as physical health.", "/ˌwɛl ˈbiːɪŋ/", "noun"],
        ["chronic", "Lasting for a long time", "She suffers from chronic back pain.", "/ˈkrɒnɪk/", "adjective"],
        ["detrimental", "Causing harm or damage", "Smoking is detrimental to your health.", "/ˌdɛtrɪˈmɛntl/", "adjective"],
        ["ailment", "An illness, typically not serious", "He suffers from various minor ailments.", "/ˈeɪlmənt/", "noun"],
      ],
    },
    "technology-internet": {
      beginner: [
        ["computer", "An electronic device for storing data", "I use my computer for homework.", "/kəmˈpjuːtər/", "noun"],
        ["phone", "A device for talking to people far away", "Can I use your phone?", "/foʊn/", "noun"],
        ["internet", "A global network connecting computers", "I use the internet every day.", "/ˈɪntərˌnɛt/", "noun"],
        ["email", "Electronic mail sent via the internet", "I sent you an email yesterday.", "/ˈiːmeɪl/", "noun"],
        ["website", "A set of pages on the internet", "This website has useful information.", "/ˈwɛbˌsaɪt/", "noun"],
        ["password", "A secret word to access something", "Don't share your password.", "/ˈpæsˌwɜːrd/", "noun"],
        ["download", "To copy data from the internet", "I need to download this file.", "/ˌdaʊnˈloʊd/", "verb"],
        ["search", "To look for information online", "I search for answers on Google.", "/sɜːrtʃ/", "verb"],
        ["screen", "The display of a device", "The screen is too bright.", "/skriːn/", "noun"],
        ["app", "A software application on a phone", "I downloaded a new language app.", "/æp/", "noun"],
      ],
      intermediate: [
        ["algorithm", "A set of rules for solving a problem", "Social media algorithms control what you see.", "/ˈælɡəˌrɪðəm/", "noun"],
        ["software", "Programs that run on a computer", "We need to update the software.", "/ˈsɒftˌwɛr/", "noun"],
        ["hardware", "The physical parts of a computer", "The hardware needs to be replaced.", "/ˈhɑːrdˌwɛr/", "noun"],
        ["cloud storage", "Saving files on remote servers", "I keep all my photos in cloud storage.", "/klaʊd ˈstɔːrɪdʒ/", "noun"],
        ["cyber security", "Protection of computer systems from threats", "Cyber security is increasingly important.", "/ˈsaɪbər sɪˈkjʊrɪti/", "noun"],
        ["artificial intelligence", "Computer systems that simulate human intelligence", "Artificial intelligence is changing many industries.", "/ˌɑːrtɪˈfɪʃəl ɪnˈtɛlɪdʒəns/", "noun"],
        ["streaming", "Watching or listening to content online in real time", "Streaming services are very popular.", "/ˈstriːmɪŋ/", "noun"],
        ["bandwidth", "The capacity for data transfer", "Video calls require high bandwidth.", "/ˈbændˌwɪdθ/", "noun"],
        ["encrypt", "To convert information into a secret code", "The message is encrypted for security.", "/ɪnˈkrɪpt/", "verb"],
        ["glitch", "A small problem in a system", "There was a glitch in the app.", "/ɡlɪtʃ/", "noun"],
      ],
      ielts: [
        ["digital divide", "The gap between those with and without technology access", "The digital divide affects rural communities.", "/ˈdɪdʒɪtl dɪˈvaɪd/", "noun"],
        ["obsolescence", "The process of becoming outdated", "Planned obsolescence encourages frequent purchases.", "/ˌɒbsəˈlɛsəns/", "noun"],
        ["automation", "Using technology to perform tasks without humans", "Automation may replace many jobs.", "/ˌɔːtəˈmeɪʃən/", "noun"],
        ["surveillance", "Close observation using technology", "Surveillance cameras are everywhere in modern cities.", "/sərˈveɪləns/", "noun"],
        ["data breach", "Unauthorized access to confidential data", "The company suffered a major data breach.", "/ˈdeɪtə briːtʃ/", "noun"],
        ["disruptive", "Causing major change to an existing industry", "Smartphones were disruptive technology.", "/dɪsˈrʌptɪv/", "adjective"],
        ["ubiquitous", "Present everywhere", "Smartphones have become ubiquitous.", "/juːˈbɪkwɪtəs/", "adjective"],
        ["biometric", "Using physical characteristics for identification", "Biometric authentication uses fingerprints.", "/ˌbaɪoʊˈmɛtrɪk/", "adjective"],
        ["proliferation", "Rapid increase in numbers", "The proliferation of fake news is concerning.", "/prəˌlɪfəˈreɪʃən/", "noun"],
        ["innovation", "A new method, idea, or product", "Innovation drives economic growth.", "/ˌɪnəˈveɪʃən/", "noun"],
      ],
    },
  };

  if (topicVocabs[topicSlug]) return topicVocabs[topicSlug];

  // For remaining topics, generate basic vocabulary
  const topicName = TOPICS.find(t => t.slug === topicSlug)?.name || "General";
  return {
    beginner: Array.from({ length: 10 }, (_, i) => [
      `${topicName.toLowerCase().split(" ")[0]}_word_${i + 1}`,
      `A common word related to ${topicName}`,
      `This is an example sentence about ${topicName.toLowerCase()}.`,
      "/word/",
      "noun"
    ] as VocabEntry),
    intermediate: Array.from({ length: 10 }, (_, i) => [
      `${topicName.toLowerCase().split(" ")[0]}_term_${i + 1}`,
      `An intermediate term related to ${topicName}`,
      `This intermediate example relates to ${topicName.toLowerCase()}.`,
      "/term/",
      "noun"
    ] as VocabEntry),
    ielts: Array.from({ length: 10 }, (_, i) => [
      `${topicName.toLowerCase().split(" ")[0]}_concept_${i + 1}`,
      `An advanced concept related to ${topicName}`,
      `This advanced example discusses ${topicName.toLowerCase()}.`,
      "/concept/",
      "noun"
    ] as VocabEntry),
  };
}

// More detailed vocab for remaining key topics
const MORE_VOCABULARY: Record<string, TopicVocab> = {
  "environment-nature": {
    beginner: [
      ["tree", "A tall plant with a trunk and branches", "There is a big tree in our garden.", "/triː/", "noun"],
      ["river", "A large natural stream of water", "We swam in the river.", "/ˈrɪvər/", "noun"],
      ["mountain", "A very high natural area of land", "The mountain is covered with snow.", "/ˈmaʊntɪn/", "noun"],
      ["flower", "The colorful part of a plant", "She gave me a beautiful flower.", "/ˈflaʊər/", "noun"],
      ["animal", "A living creature that can move", "My favorite animal is a dog.", "/ˈænɪml/", "noun"],
      ["rain", "Water falling from clouds", "It started to rain heavily.", "/reɪn/", "noun"],
      ["sun", "The star that gives Earth light and heat", "The sun is very bright today.", "/sʌn/", "noun"],
      ["forest", "A large area covered with trees", "We went for a walk in the forest.", "/ˈfɒrɪst/", "noun"],
      ["ocean", "A very large area of salt water", "The ocean is deep and blue.", "/ˈoʊʃən/", "noun"],
      ["recycle", "To process waste so it can be used again", "We recycle paper and plastic.", "/riːˈsaɪkl/", "verb"],
    ],
    intermediate: [
      ["biodiversity", "The variety of plant and animal life", "We need to protect biodiversity.", "/ˌbaɪoʊdaɪˈvɜːrsɪti/", "noun"],
      ["pollution", "The introduction of harmful substances into the environment", "Air pollution is a serious problem.", "/pəˈluːʃən/", "noun"],
      ["conservation", "The protection of natural resources", "Conservation efforts have saved many species.", "/ˌkɒnsərˈveɪʃən/", "noun"],
      ["greenhouse effect", "The trapping of heat in the atmosphere", "The greenhouse effect causes global warming.", "/ˈɡriːnhaʊs ɪˈfɛkt/", "noun"],
      ["endangered", "At risk of extinction", "Pandas are an endangered species.", "/ɪnˈdeɪndʒərd/", "adjective"],
      ["deforestation", "The clearing of forests", "Deforestation destroys animal habitats.", "/diːˌfɒrɪˈsteɪʃən/", "noun"],
      ["renewable", "Able to be used again and again", "Solar energy is a renewable resource.", "/rɪˈnjuːəbl/", "adjective"],
      ["ecosystem", "A community of living things and their environment", "Coral reefs are delicate ecosystems.", "/ˈiːkoʊˌsɪstəm/", "noun"],
      ["drought", "A long period without rain", "The drought caused crops to fail.", "/draʊt/", "noun"],
      ["carbon footprint", "The amount of CO2 produced by activities", "We should try to reduce our carbon footprint.", "/ˈkɑːrbən ˈfʊtprɪnt/", "noun"],
    ],
    ielts: [
      ["sustainability", "Meeting present needs without compromising the future", "Sustainability should guide all development.", "/səˌsteɪnəˈbɪlɪti/", "noun"],
      ["anthropogenic", "Caused by human activity", "Most climate change is anthropogenic.", "/ˌænθrəpoʊˈdʒɛnɪk/", "adjective"],
      ["degradation", "The process of becoming worse in quality", "Environmental degradation threatens ecosystems.", "/ˌdɛɡrəˈdeɪʃən/", "noun"],
      ["fossil fuel", "Energy sources like coal, oil, and gas", "We must reduce our dependence on fossil fuels.", "/ˈfɒsl fjuːəl/", "noun"],
      ["ecological", "Related to the relationship between organisms and environment", "The ecological balance is being disrupted.", "/ˌiːkəˈlɒdʒɪkl/", "adjective"],
      ["emissions", "Gases released into the atmosphere", "Carbon emissions must be reduced urgently.", "/ɪˈmɪʃənz/", "noun"],
      ["biodegradable", "Capable of being decomposed naturally", "We should use biodegradable packaging.", "/ˌbaɪoʊdɪˈɡreɪdəbl/", "adjective"],
      ["habitat", "The natural home of an animal or plant", "Urbanization destroys natural habitats.", "/ˈhæbɪtæt/", "noun"],
      ["afforestation", "The process of planting trees on bare land", "Afforestation can help combat climate change.", "/əˌfɒrɪˈsteɪʃən/", "noun"],
      ["ozone layer", "A layer in the atmosphere that absorbs UV radiation", "The ozone layer protects us from harmful rays.", "/ˈoʊzoʊn ˈleɪər/", "noun"],
    ],
  },
  "work-career": {
    beginner: [
      ["job", "Work that you do to earn money", "I got a new job last week.", "/dʒɒb/", "noun"],
      ["office", "A place where people work", "I work in an office.", "/ˈɒfɪs/", "noun"],
      ["boss", "The person in charge at work", "My boss is very friendly.", "/bɒs/", "noun"],
      ["salary", "Money you earn for working", "His salary is paid monthly.", "/ˈsæləri/", "noun"],
      ["meeting", "A gathering of people to discuss things", "We have a meeting at 10 AM.", "/ˈmiːtɪŋ/", "noun"],
      ["colleague", "A person you work with", "My colleague helped me with the report.", "/ˈkɒliːɡ/", "noun"],
      ["manager", "A person who controls a team or business", "The manager approved my request.", "/ˈmænɪdʒər/", "noun"],
      ["company", "A business organization", "She works for a big company.", "/ˈkʌmpəni/", "noun"],
      ["busy", "Having a lot of work to do", "I am very busy this week.", "/ˈbɪzi/", "adjective"],
      ["hire", "To give someone a job", "The company will hire new staff.", "/ˈhaɪər/", "verb"],
    ],
    intermediate: [
      ["promotion", "Getting a higher position at work", "She got a promotion to senior manager.", "/prəˈmoʊʃən/", "noun"],
      ["deadline", "The latest time something must be finished", "We need to meet the deadline.", "/ˈdɛdˌlaɪn/", "noun"],
      ["resume", "A document listing your qualifications", "Send your resume to the HR department.", "/ˈrɛzjʊˌmeɪ/", "noun"],
      ["interview", "A formal meeting to assess a job candidate", "I have a job interview tomorrow.", "/ˈɪntərvjuː/", "noun"],
      ["freelancer", "A self-employed person", "She works as a freelancer from home.", "/ˈfriːˌlænsər/", "noun"],
      ["negotiation", "Discussion aimed at reaching an agreement", "Salary negotiation is an important skill.", "/nɪˌɡoʊʃiˈeɪʃən/", "noun"],
      ["networking", "Making professional contacts", "Networking is crucial for career growth.", "/ˈnɛtˌwɜːrkɪŋ/", "noun"],
      ["commute", "To travel regularly between home and work", "I commute by train every day.", "/kəˈmjuːt/", "verb"],
      ["overtime", "Time worked beyond normal hours", "She worked overtime to finish the project.", "/ˈoʊvərˌtaɪm/", "noun"],
      ["redundancy", "Being dismissed because the job is no longer needed", "The company announced 200 redundancies.", "/rɪˈdʌndənsi/", "noun"],
    ],
    ielts: [
      ["work-life balance", "Equal time given to work and personal life", "Achieving work-life balance is challenging.", "/wɜːrk laɪf ˈbæləns/", "noun"],
      ["entrepreneurship", "The activity of starting businesses", "Entrepreneurship requires creativity and risk-taking.", "/ˌɒntrəprəˈnɜːrʃɪp/", "noun"],
      ["meritocratic", "Based on ability rather than privilege", "A meritocratic workplace rewards talent.", "/ˌmɛrɪtəˈkrætɪk/", "adjective"],
      ["remuneration", "Payment for work done", "The remuneration package includes benefits.", "/rɪˌmjuːnəˈreɪʃən/", "noun"],
      ["burnout", "Physical and mental exhaustion from overwork", "Burnout is common in high-pressure jobs.", "/ˈbɜːrnaʊt/", "noun"],
      ["telecommuting", "Working from home using technology", "Telecommuting has become widespread.", "/ˈtɛlɪkəˌmjuːtɪŋ/", "noun"],
      ["gig economy", "A market with short-term jobs", "The gig economy offers flexibility but less security.", "/ɡɪɡ ɪˈkɒnəmi/", "noun"],
      ["vocational", "Related to a specific occupation", "Vocational training prepares students for specific careers.", "/voʊˈkeɪʃənəl/", "adjective"],
      ["hierarchical", "Arranged in order of rank", "The company has a hierarchical structure.", "/ˌhaɪəˈrɑːrkɪkl/", "adjective"],
      ["outsource", "To hire an external company for tasks", "Many companies outsource customer service.", "/ˈaʊtˌsɔːrs/", "verb"],
    ],
  },
};

// Merge all vocabulary
const ALL_VOCAB = { ...VOCABULARY, ...MORE_VOCABULARY };

// Speaking questions generator
function generateSpeakingQuestions(topicSlug: string, topicName: string, levelSlug: string): Array<{
  questionText: string;
  templateAnswer: string;
  linkingWords: string;
  answerStructure: string;
  tips: string;
}> {
  const linkingWordsBeginner = JSON.stringify(["and", "but", "because", "so", "also", "for example"]);
  const linkingWordsIntermediate = JSON.stringify(["however", "moreover", "in addition", "on the other hand", "for instance", "consequently", "furthermore", "although"]);
  const linkingWordsIelts = JSON.stringify(["nevertheless", "notwithstanding", "in light of", "with regard to", "it is worth noting that", "from my perspective", "arguably", "by and large"]);

  const questions: Record<string, Array<{ q: string; t: string; s: string; tip: string }>> = {
    beginner: [
      { q: `Do you like ${topicName.toLowerCase()}? Why or why not?`, t: `Yes, I like ${topicName.toLowerCase()} because it is very interesting. For example, I enjoy learning new things about it.`, s: "1. Say yes or no 2. Give a simple reason 3. Give one example", tip: "Keep your answer simple. Use 'because' to explain why." },
      { q: `Tell me about your experience with ${topicName.toLowerCase()}.`, t: `I have some experience with ${topicName.toLowerCase()}. For example, I often read about it and also try to learn new things every week.`, s: "1. Say if you have experience 2. Give a simple example 3. Say how often", tip: "Use simple past tense for experiences." },
      { q: `What is your favorite thing about ${topicName.toLowerCase()}?`, t: `My favorite thing about ${topicName.toLowerCase()} is that it helps me learn. I think it is very useful and interesting.`, s: "1. State your favorite thing 2. Explain why 3. Add your opinion", tip: "Start with 'My favorite thing is...' to answer clearly." },
      { q: `How often do you think about ${topicName.toLowerCase()}?`, t: `I think about ${topicName.toLowerCase()} quite often, maybe every day. It is an important part of my life.`, s: "1. Say how often 2. Give a reason 3. Say why it matters", tip: "Use frequency words: always, often, sometimes, rarely." },
      { q: `Who do you talk to about ${topicName.toLowerCase()}?`, t: `I usually talk to my friends and family about ${topicName.toLowerCase()}. We enjoy discussing it together.`, s: "1. Name the people 2. Say what you discuss 3. Say how you feel about it", tip: "Name specific people to make your answer more personal." },
      { q: `What did you learn about ${topicName.toLowerCase()} recently?`, t: `Recently, I learned some new words about ${topicName.toLowerCase()}. It was very helpful for my English.`, s: "1. Say what you learned 2. When you learned it 3. How it helped you", tip: "Use 'recently' or 'last week' to set the time." },
      { q: `Is ${topicName.toLowerCase()} popular in your country?`, t: `Yes, ${topicName.toLowerCase()} is very popular in my country. Many people are interested in it, especially young people.`, s: "1. Say yes or no 2. Explain how popular 3. Say who is interested", tip: "Think about people in your country and what they enjoy." },
      { q: `What words about ${topicName.toLowerCase()} do you know?`, t: `I know some words about ${topicName.toLowerCase()}. For example, I learned words like... These words are useful for daily conversation.`, s: "1. Say if you know words 2. Give examples 3. Say why they are useful", tip: "Try to use at least 2-3 vocabulary words from this topic." },
      { q: `Would you like to learn more about ${topicName.toLowerCase()}? Why?`, t: `Yes, I would like to learn more about ${topicName.toLowerCase()} because it will help me communicate better in English.`, s: "1. Say yes or no 2. Give your reason 3. Explain the benefit", tip: "Use 'would like to' for future wishes." },
      { q: `Describe ${topicName.toLowerCase()} in three words.`, t: `I would describe ${topicName.toLowerCase()} as interesting, useful, and important. These words show how I feel about this topic.`, s: "1. Choose three adjectives 2. Say each word 3. Briefly explain why", tip: "Think of positive adjectives that truly describe the topic." },
      { q: `Do your friends like ${topicName.toLowerCase()}?`, t: `Yes, most of my friends like ${topicName.toLowerCase()}. We sometimes talk about it when we meet.`, s: "1. Say yes/no 2. How many friends 3. What you do together", tip: "Use 'most of', 'some of', 'a few of' to be specific." },
      { q: `When was the last time you did something related to ${topicName.toLowerCase()}?`, t: `The last time was about a week ago. I was reading about ${topicName.toLowerCase()} in English and I found it very interesting.`, s: "1. Say when 2. What you did 3. How you felt", tip: "Use past tense: 'was', 'did', 'went', 'had'." },
    ],
    intermediate: [
      { q: `What are the advantages and disadvantages of ${topicName.toLowerCase()}?`, t: `There are several advantages of ${topicName.toLowerCase()}. Firstly, it broadens your knowledge. However, one disadvantage might be that it requires time and effort. On the other hand, the benefits usually outweigh the drawbacks.`, s: "1. State advantages (2-3) 2. State disadvantages (1-2) 3. Give your overall opinion", tip: "Use 'firstly, secondly' for advantages and 'however, on the other hand' for disadvantages." },
      { q: `How has ${topicName.toLowerCase()} changed in your country over the past decade?`, t: `${topicName} has changed significantly over the past decade. For instance, technology has transformed how people approach it. Moreover, attitudes have become more open and progressive.`, s: "1. State the main change 2. Give specific examples 3. Explain the impact", tip: "Use present perfect ('has changed') to connect past to present." },
      { q: `Compare ${topicName.toLowerCase()} in your country with another country.`, t: `In my country, ${topicName.toLowerCase()} is quite different from other countries. For example, while we tend to be more traditional, other countries might be more innovative. Nevertheless, there are also similarities.`, s: "1. Describe your country's approach 2. Contrast with another country 3. Note similarities", tip: "Use comparative structures: 'more...than', 'less...than', 'similar to'." },
      { q: `What role does ${topicName.toLowerCase()} play in modern society?`, t: `${topicName} plays a significant role in modern society. It influences how people think and behave. Furthermore, it contributes to economic and social development.`, s: "1. State its importance 2. Give examples of influence 3. Discuss future impact", tip: "Think about how it affects daily life, economy, and culture." },
      { q: `What advice would you give someone interested in ${topicName.toLowerCase()}?`, t: `I would advise them to start gradually and set realistic goals. In addition, they should seek guidance from experienced people. Most importantly, they should stay motivated and persistent.`, s: "1. Give first piece of advice 2. Add more suggestions 3. Emphasize the most important one", tip: "Use 'I would advise/recommend/suggest' to give advice." },
      { q: `Do you think ${topicName.toLowerCase()} will be more or less important in the future?`, t: `I believe ${topicName.toLowerCase()} will become increasingly important in the future. This is because society is changing rapidly and people need to adapt. Consequently, understanding this topic will be essential.`, s: "1. State your prediction 2. Explain why 3. Discuss consequences", tip: "Use future forms and prediction language: 'will', 'is likely to', 'might'." },
      { q: `What problems are related to ${topicName.toLowerCase()} and how can they be solved?`, t: `One major problem related to ${topicName.toLowerCase()} is lack of awareness. To solve this, education and communication are essential. Additionally, governments could implement better policies.`, s: "1. Identify 1-2 problems 2. Suggest solutions for each 3. Discuss who should act", tip: "Use 'could', 'should', 'need to' for suggestions." },
      { q: `How does ${topicName.toLowerCase()} affect different generations?`, t: `${topicName} affects different generations in various ways. Younger people tend to be more open, whereas older generations may have more traditional views. However, both groups can learn from each other.`, s: "1. Compare young and old 2. Give specific examples 3. Find common ground", tip: "Use 'whereas', 'while', 'compared to' for comparing generations." },
      { q: `What is the most interesting fact you know about ${topicName.toLowerCase()}?`, t: `One of the most interesting facts I know about ${topicName.toLowerCase()} is that it has evolved dramatically over time. This is fascinating because it shows how society develops and adapts.`, s: "1. State the fact 2. Explain why it's interesting 3. Connect to broader context", tip: "Use 'fascinating', 'intriguing', 'remarkable' to show interest." },
      { q: `How does media influence people's understanding of ${topicName.toLowerCase()}?`, t: `Media plays a crucial role in shaping people's understanding of ${topicName.toLowerCase()}. Social media, in particular, has made information more accessible. However, it can also spread misinformation.`, s: "1. Discuss media's role 2. Give positive examples 3. Mention potential negatives", tip: "Consider both traditional and social media influences." },
      { q: `If you could change one thing about ${topicName.toLowerCase()} in your country, what would it be?`, t: `If I could change one thing, I would improve access and education about ${topicName.toLowerCase()}. This would benefit society because more people could participate and contribute.`, s: "1. State what you'd change 2. Explain how 3. Discuss the benefits", tip: "Use second conditional: 'If I could... I would...'" },
      { q: `What personal experience has shaped your view of ${topicName.toLowerCase()}?`, t: `A personal experience that shaped my view was when I first encountered ${topicName.toLowerCase()} during my studies. This experience taught me the importance of being open-minded and curious.`, s: "1. Describe the experience 2. Explain what you learned 3. How it changed your view", tip: "Use past tense to tell your story, then present tense for what you think now." },
    ],
    ielts: [
      { q: `To what extent do you agree that ${topicName.toLowerCase()} is essential for personal development?`, t: `I strongly agree that ${topicName.toLowerCase()} is essential for personal development. From my perspective, it cultivates critical thinking and broadens horizons. Nevertheless, its value depends on individual circumstances and goals.`, s: "1. State your position clearly 2. Provide 2-3 supporting arguments 3. Acknowledge opposing views 4. Conclude with a balanced statement", tip: "IELTS examiners look for nuanced opinions. Avoid extreme positions." },
      { q: `Describe a time when ${topicName.toLowerCase()} had a significant impact on your life. You should say: what happened, when it happened, how it affected you, and explain why it was significant.`, t: `I'd like to talk about a time when ${topicName.toLowerCase()} significantly impacted my life. It was approximately two years ago when I had an experience that fundamentally changed my perspective. The impact was profound because it challenged my assumptions and encouraged me to think differently. Looking back, this was a pivotal moment in my personal growth.`, s: "Part 2 cue card format: 1. Set the scene 2. Describe what happened 3. Explain the impact 4. Reflect on significance", tip: "Speak for 1-2 minutes. Use time markers and discourse markers to organize your talk." },
      { q: `Some people argue that ${topicName.toLowerCase()} receives too much attention in today's society. Do you agree?`, t: `While it is true that ${topicName.toLowerCase()} receives considerable attention, I would argue that this focus is largely justified. In light of current global challenges, understanding this topic is more important than ever. Notwithstanding, there is merit in the argument that resources could be more equitably distributed.`, s: "1. Acknowledge the argument 2. Present your counter-argument 3. Support with evidence 4. Offer a balanced conclusion", tip: "Use academic language and show you can see multiple perspectives." },
      { q: `How might ${topicName.toLowerCase()} evolve over the next 50 years?`, t: `It is conceivable that ${topicName.toLowerCase()} will undergo transformative changes over the next half-century. Technological advancements and shifting societal values will likely reshape our understanding. Furthermore, globalization may homogenize or diversify approaches, depending on cultural resilience.`, s: "1. Make predictions with hedging language 2. Discuss driving factors 3. Consider multiple scenarios 4. Evaluate likelihood", tip: "Use hedging: 'it is likely', 'may well', 'could potentially', 'it remains to be seen'." },
      { q: `What is the relationship between ${topicName.toLowerCase()} and globalization?`, t: `The relationship between ${topicName.toLowerCase()} and globalization is multifaceted. On one hand, globalization has facilitated the exchange of ideas and practices. On the other hand, it has also led to cultural homogenization. By and large, the impact has been both positive and negative.`, s: "1. Define the relationship 2. Discuss positive aspects 3. Address negative aspects 4. Provide your assessment", tip: "Show analytical thinking. Use cause-and-effect language." },
      { q: `Should governments invest more resources in ${topicName.toLowerCase()}? Why or why not?`, t: `I firmly believe that governments should allocate additional resources to ${topicName.toLowerCase()}, provided that such investment is evidence-based and accountable. The potential returns in terms of social welfare and economic development are substantial. Nevertheless, this must be balanced against competing priorities.`, s: "1. State your position 2. Provide economic/social justification 3. Address counterarguments 4. Suggest conditions or limitations", tip: "Reference real-world examples if possible. Show mature reasoning." },
      { q: `Compare the importance of ${topicName.toLowerCase()} in developing and developed countries.`, t: `The significance of ${topicName.toLowerCase()} varies considerably between developing and developed nations. In developed countries, the focus tends to be on refinement and innovation, whereas developing nations often prioritize foundational access. Arguably, both contexts present unique challenges and opportunities.`, s: "1. Identify key differences 2. Explain reasons for differences 3. Find common ground 4. Evaluate which approach is more effective", tip: "Use sophisticated comparison structures. Avoid stereotyping." },
      { q: `What ethical considerations surround ${topicName.toLowerCase()}?`, t: `${topicName} raises several ethical considerations that merit careful examination. These include questions of equity, access, and responsibility. It is worth noting that ethical frameworks vary across cultures, making universal conclusions difficult to draw.`, s: "1. Identify 2-3 ethical issues 2. Explore different perspectives 3. Discuss cultural variations 4. Suggest ethical principles", tip: "Demonstrate critical thinking and awareness of different viewpoints." },
      { q: `How does ${topicName.toLowerCase()} intersect with education and employment?`, t: `The intersection of ${topicName.toLowerCase()} with education and employment is increasingly significant. Educational institutions are incorporating it into curricula, while employers value related skills. Consequently, proficiency in this area can enhance career prospects.`, s: "1. Discuss educational links 2. Discuss employment links 3. Analyze the impact 4. Predict future trends", tip: "Use formal vocabulary and connect ideas logically." },
      { q: `In what ways can ${topicName.toLowerCase()} contribute to solving global challenges?`, t: `${topicName} has the potential to contribute meaningfully to addressing global challenges such as inequality and environmental degradation. Through innovation and collaboration, it can offer solutions that transcend national boundaries. However, realizing this potential requires coordinated international effort.`, s: "1. Identify relevant global challenges 2. Explain how the topic helps 3. Discuss barriers 4. Suggest ways forward", tip: "Think big picture. Reference UN Sustainable Development Goals if relevant." },
      { q: `Critically evaluate the role of technology in shaping ${topicName.toLowerCase()}.`, t: `Technology has fundamentally altered the landscape of ${topicName.toLowerCase()}, creating both opportunities and challenges. Digital platforms have democratized access, yet they have also introduced concerns about quality and authenticity. A balanced approach to technological integration is therefore essential.`, s: "1. Describe technology's impact 2. Discuss benefits 3. Analyze risks 4. Recommend a balanced approach", tip: "Use evaluative language: 'fundamentally', 'significantly', 'critically important'." },
      { q: `What lessons can we learn from different cultural approaches to ${topicName.toLowerCase()}?`, t: `Different cultures offer valuable insights into ${topicName.toLowerCase()} that can enrich our understanding. For instance, Eastern and Western approaches often complement each other. By studying these differences, we can develop more inclusive and effective strategies.`, s: "1. Identify cultural differences 2. Explain what each offers 3. Discuss cross-cultural learning 4. Suggest practical applications", tip: "Show cultural awareness and sensitivity. Avoid generalizations." },
    ],
  };

  const levelKey = levelSlug === "beginner" || levelSlug === "elementary" ? "beginner" :
                   levelSlug === "ielts" ? "ielts" : "intermediate";

  const lw = levelKey === "beginner" ? linkingWordsBeginner : levelKey === "ielts" ? linkingWordsIelts : linkingWordsIntermediate;

  return questions[levelKey].map(q => ({
    questionText: q.q,
    templateAnswer: q.t,
    linkingWords: lw,
    answerStructure: q.s,
    tips: q.tip,
  }));
}

// Quiz generator
function generateQuizzes(vocabEntries: VocabEntry[], topicName: string): Array<{
  type: string;
  question: string;
  options: string | null;
  correctAnswer: string;
  explanation: string;
}> {
  const quizzes: Array<{ type: string; question: string; options: string | null; correctAnswer: string; explanation: string }> = [];

  // Multiple choice quizzes from vocabulary
  for (let i = 0; i < Math.min(3, vocabEntries.length); i++) {
    const correct = vocabEntries[i];
    const wrongOptions = vocabEntries.filter((_, j) => j !== i).slice(0, 3).map(v => v[1]);
    const allOptions = [correct[1], ...wrongOptions].sort(() => Math.random() - 0.5);
    quizzes.push({
      type: "multiple_choice",
      question: `What is the meaning of "${correct[0]}"?`,
      options: JSON.stringify(allOptions),
      correctAnswer: correct[1],
      explanation: `"${correct[0]}" means: ${correct[1]}. Example: ${correct[2]}`,
    });
  }

  // Gap fill quizzes
  for (let i = 3; i < Math.min(6, vocabEntries.length); i++) {
    const entry = vocabEntries[i];
    const sentence = entry[2].replace(new RegExp(entry[0], "i"), "___");
    quizzes.push({
      type: "gap_fill",
      question: `Fill in the blank: ${sentence}`,
      options: null,
      correctAnswer: entry[0],
      explanation: `The correct word is "${entry[0]}". Full sentence: ${entry[2]}`,
    });
  }

  // Sentence build quizzes
  for (let i = 6; i < Math.min(8, vocabEntries.length); i++) {
    const entry = vocabEntries[i];
    quizzes.push({
      type: "sentence_build",
      question: `Write a sentence using the word "${entry[0]}" (meaning: ${entry[1]})`,
      options: null,
      correctAnswer: entry[2],
      explanation: `Example sentence: ${entry[2]}`,
    });
  }

  return quizzes;
}

// Discussion generator
function generateDiscussion(topicName: string, levelSlug: string): { title: string; description: string; prompts: string; tips: string } {
  const isIelts = levelSlug === "ielts" || levelSlug === "advanced" || levelSlug === "upper-intermediate";
  const isBeginner = levelSlug === "beginner" || levelSlug === "elementary";

  if (isBeginner) {
    return {
      title: `Let's Talk About ${topicName}`,
      description: `Simple discussion about ${topicName.toLowerCase()} for beginners. Practice expressing basic opinions and preferences.`,
      prompts: JSON.stringify([
        `What do you know about ${topicName.toLowerCase()}?`,
        `Do you like ${topicName.toLowerCase()}? Tell your partner why.`,
        `Tell your partner about your experience with ${topicName.toLowerCase()}.`,
        `What new words about ${topicName.toLowerCase()} did you learn today?`,
        `Ask your partner two questions about ${topicName.toLowerCase()}.`,
      ]),
      tips: "Speak slowly and clearly. It's okay to make mistakes. Try to use new vocabulary words.",
    };
  }

  if (isIelts) {
    return {
      title: `Critical Discussion: ${topicName} in the Modern World`,
      description: `In-depth discussion exploring complex aspects of ${topicName.toLowerCase()}. Develop analytical thinking and academic speaking skills.`,
      prompts: JSON.stringify([
        `Analyze the socioeconomic impact of ${topicName.toLowerCase()} in your country. What evidence supports your analysis?`,
        `To what extent should governments regulate ${topicName.toLowerCase()}? Consider individual freedom versus collective welfare.`,
        `Compare and contrast how ${topicName.toLowerCase()} is perceived in different cultures. What factors contribute to these differences?`,
        `Predict how ${topicName.toLowerCase()} will evolve in the next 20 years. What evidence supports your prediction?`,
        `If you were advising a policy-maker about ${topicName.toLowerCase()}, what recommendations would you make and why?`,
      ]),
      tips: "Use advanced vocabulary and complex sentence structures. Support your arguments with examples and evidence. Show awareness of multiple perspectives.",
    };
  }

  return {
    title: `Discussing ${topicName}: Opinions and Ideas`,
    description: `Engage in meaningful conversation about ${topicName.toLowerCase()}. Practice expressing opinions, agreeing, and disagreeing politely.`,
    prompts: JSON.stringify([
      `What are the main benefits of ${topicName.toLowerCase()} in today's world?`,
      `How has ${topicName.toLowerCase()} changed in your lifetime? Do you think these changes are positive?`,
      `What challenges do people face regarding ${topicName.toLowerCase()}? How can these be addressed?`,
      `Compare ${topicName.toLowerCase()} in your country with what you know about other countries.`,
      `If you could improve one aspect of ${topicName.toLowerCase()} in your community, what would it be?`,
    ]),
    tips: "Use opinion phrases like 'In my opinion', 'I believe that'. Practice agreeing ('I agree because...') and disagreeing politely ('I see your point, but...').",
  };
}

// Lesson plans
const LESSON_PLANS = [
  {
    topicSlug: "travel-tourism", title: "Exploring the World Through Words",
    objectives: JSON.stringify(["Learn 15+ travel vocabulary words", "Practice asking and answering travel questions", "Develop fluency in describing travel experiences", "Use past tense correctly when talking about trips"]),
    materials: JSON.stringify(["Whiteboard", "Travel flashcards with images", "Handout with travel scenarios", "Timer for activities"]),
    warmUp: "Travel Bingo: Students walk around the room asking classmates travel questions (Have you ever...?). First to complete a row wins. This gets students talking and moving immediately.",
    mainActivity: "Photo Story: Show 10 travel photos. Students describe what they see, then create a story connecting 3 photos. Practice vocabulary in context. Teacher provides new words on the board. Students then role-play travel scenarios (booking hotel, asking directions, ordering food).",
    practice: "Speed Dating Travel: Students sit in pairs. One describes their dream trip for 2 minutes while the other asks questions. Switch partners every 4 minutes. Then, groups of 4 plan a trip together using target vocabulary, presenting to the class.",
    coolDown: "Travel Advice Column: Each student writes a travel question on paper. Papers are passed around and each student writes advice. Share the best advice with the class. Review key vocabulary together.",
    homework: "Write a blog post (150 words) about a real or imaginary trip. Use at least 10 vocabulary words from class."
  },
  {
    topicSlug: "food-cooking", title: "Kitchen Conversations",
    objectives: JSON.stringify(["Master 15+ food and cooking vocabulary", "Describe recipes using sequence words", "Express food preferences with reasons", "Practice giving and following instructions"]),
    materials: JSON.stringify(["Recipe cards", "Food picture sets", "Cooking verb flashcards", "Whiteboard and markers"]),
    warmUp: "Food Chain Game: Students stand in a circle. One says a food word, next student says a word starting with the last letter. Anyone who repeats or hesitates sits down. Introduce new vocabulary naturally.",
    mainActivity: "Master Chef Challenge: In pairs, students receive recipe cards with pictures but missing instructions. They must describe the cooking process using vocabulary like sauté, marinate, boil. Then, they teach their recipe to another pair. Teacher corrects and provides vocabulary on the board.",
    practice: "Restaurant Role-Play: Set up the classroom as a restaurant. Students take turns being waiter and customer. Practice ordering, asking about ingredients, making complaints politely, and paying the bill. Each round introduces new vocabulary.",
    coolDown: "My Perfect Meal: Students describe their ideal three-course meal to a partner, using as many new vocabulary words as possible. Class votes on the most creative and delicious-sounding meal.",
    homework: "Record yourself explaining how to make your favorite dish. Use at least 8 cooking vocabulary words. Bring the recording to next class."
  },
  {
    topicSlug: "family-relationships", title: "Family Ties and Bonds",
    objectives: JSON.stringify(["Learn vocabulary for family relationships", "Describe family members using adjectives", "Compare family structures across cultures", "Practice present and past tenses"]),
    materials: JSON.stringify(["Family tree templates", "Adjective word cards", "Discussion question cards", "Photos of different families"]),
    warmUp: "Two Truths and a Lie — Family Edition: Students write three statements about their family (two true, one false). Others guess which is the lie. Great for building rapport and introducing family vocabulary.",
    mainActivity: "Family Tree Presentation: Students create and present their family tree to a partner, describing each member with at least 2 adjectives. Then, pairs compare their families (similarities and differences). Teacher introduces vocabulary for extended family, relationships, and personality traits.",
    practice: "Family Interview: Students interview each other using prepared questions about family traditions, roles, and relationships. Record answers and present findings to the group. Practice reported speech: 'She told me that her grandmother...'",
    coolDown: "Family Values Ranking: Give students cards with family values (respect, love, education, tradition). They rank them and explain their choices. Compare rankings in groups.",
    homework: "Write a paragraph about the person in your family you admire most and why. Use at least 8 vocabulary words."
  },
  {
    topicSlug: "education-learning", title: "Learning How to Learn",
    objectives: JSON.stringify(["Acquire education-related vocabulary", "Discuss learning styles and preferences", "Compare education systems", "Express opinions about educational issues"]),
    materials: JSON.stringify(["Learning style quiz handout", "Education statistics cards", "Debate topic cards", "Whiteboard"]),
    warmUp: "School Memory Map: Students draw a map of their school from memory and label rooms/areas in English. Share with a partner and teach each other 3 new words.",
    mainActivity: "Education Debate: Divide class into teams. Topics: 'Homework should be banned', 'Online learning is better than classroom learning', 'University should be free'. Each team prepares arguments using target vocabulary. Conduct structured debates with speaking time limits.",
    practice: "Learning Style Workshop: Students complete a learning style quiz, discuss results in groups, and share study tips. Each group presents their best study strategies to the class using new vocabulary.",
    coolDown: "My Ideal School: In pairs, students design their ideal school — describing subjects, teachers, facilities, and rules. Present to class and vote on the best design.",
    homework: "Compare your education experience with a friend from another country (or research online). Write 150 words about the differences."
  },
  {
    topicSlug: "health-fitness", title: "Healthy Body, Healthy Mind",
    objectives: JSON.stringify(["Learn health and fitness vocabulary", "Give and understand health advice", "Discuss healthy vs unhealthy habits", "Use modal verbs for recommendations"]),
    materials: JSON.stringify(["Health habit cards", "Exercise demonstration pictures", "Healthy eating pyramid poster", "Timer"]),
    warmUp: "Health Habit Survey: Students mingle and ask classmates about health habits (exercise, sleep, diet). Tally results on the board and discuss findings as a class.",
    mainActivity: "Doctor's Office Role-Play: Students practice patient-doctor conversations. Patient describes symptoms, doctor gives advice using 'should', 'ought to', 'need to'. Rotate roles. Introduce medical and health vocabulary through context.",
    practice: "Fitness Challenge Design: Groups create a one-week fitness and healthy eating plan. Present to class with reasons for each choice. Use vocabulary like nutrition, stamina, flexibility, supplement. Class votes on the most realistic plan.",
    coolDown: "Health Myth or Fact: Teacher reads statements about health. Students stand on 'myth' or 'fact' side of room. Discuss each answer. Great for reviewing vocabulary and sparking conversation.",
    homework: "Keep a health diary for 3 days. Record what you eat, how you exercise, and how you feel. Bring to next class to discuss."
  },
  {
    topicSlug: "technology-internet", title: "Digital World Discussions",
    objectives: JSON.stringify(["Master technology vocabulary", "Discuss pros and cons of technology", "Express opinions about digital issues", "Practice conditional sentences"]),
    materials: JSON.stringify(["Tech vocabulary flashcards", "Scenario cards", "Debate preparation sheets", "Whiteboard"]),
    warmUp: "Tech Timeline: In pairs, students list the most important tech inventions of the last 50 years and rank them. Compare with other pairs. Introduces vocabulary naturally.",
    mainActivity: "Digital Dilemmas: Present ethical scenarios about technology (privacy, AI, social media addiction). Groups discuss solutions and present to class. Teacher introduces target vocabulary through scenarios. Practice 'If...would' conditional sentences.",
    practice: "Tech Support Role-Play: One student is a tech support agent, the other has a problem. Practice explaining technical issues in simple English. Rotate with different problems (password reset, software glitch, internet issues).",
    coolDown: "Future Tech Predictions: Each student writes one prediction about technology in 2050. Share and vote on most likely and most creative. Review key vocabulary.",
    homework: "Write about one technology that has changed your life. How would your life be different without it? (150 words)"
  },
  {
    topicSlug: "environment-nature", title: "Our Green Planet",
    objectives: JSON.stringify(["Learn environmental vocabulary", "Discuss environmental problems and solutions", "Express concern and suggest changes", "Practice passive voice for environmental topics"]),
    materials: JSON.stringify(["Environmental problem cards", "Solution brainstorm sheets", "Nature photos", "Recycling sorting activity"]),
    warmUp: "Nature Sound Quiz: Play sounds of nature (rain, birds, ocean). Students guess and describe what they hear. Introduces nature vocabulary in an engaging way.",
    mainActivity: "Environmental Summit: Groups represent different countries. Each presents their environmental challenges and proposed solutions. Other groups ask questions and offer advice. Introduces vocabulary like sustainability, carbon footprint, renewable energy.",
    practice: "Eco-Friendly Challenge: Groups compete to create the most environmentally friendly daily routine. Present plans using target vocabulary. Class evaluates which plan is most practical and impactful.",
    coolDown: "Green Pledge: Each student writes one environmental promise (I will... I won't...). Share with class and create a class pledge poster.",
    homework: "Research one environmental organization and write about what they do and why their work matters. Present findings next class."
  },
  {
    topicSlug: "work-career", title: "Career Paths and Professional Talk",
    objectives: JSON.stringify(["Learn professional vocabulary", "Practice job interview skills", "Discuss career goals and plans", "Use formal language appropriately"]),
    materials: JSON.stringify(["Job advertisement cards", "Interview question sets", "Resume templates", "Formal phrase reference sheets"]),
    warmUp: "Dream Job Speed Round: Students have 30 seconds each to describe their dream job without naming it. Others guess. Introduces job vocabulary in a fun way.",
    mainActivity: "Mock Interview Workshop: Students practice job interviews in pairs. One is the interviewer with prepared questions, the other is the candidate. After 10 minutes, roles switch. Teacher coaches on formal language, body language, and vocabulary.",
    practice: "Career Fair Simulation: Each student creates a poster for a company or job. Others walk around and ask questions. Practice professional conversation, networking language, and career vocabulary.",
    coolDown: "Career Advice Panel: Volunteers sit at the front and answer career questions from the class. Teacher guides vocabulary use and provides language corrections.",
    homework: "Write a cover letter for your dream job using at least 10 professional vocabulary words."
  },
  {
    topicSlug: "hobbies-leisure", title: "Free Time Fun",
    objectives: JSON.stringify(["Learn hobby and leisure vocabulary", "Describe activities with enthusiasm", "Invite and respond to invitations", "Practice present simple and continuous"]),
    materials: JSON.stringify(["Hobby picture cards", "Activity bingo sheets", "Invitation templates", "Timer"]),
    warmUp: "Hobby Charades: Students act out hobbies without speaking. Others guess using full sentences: 'I think you are playing guitar.' Fast-paced and fun way to review vocabulary.",
    mainActivity: "Hobby Fair: Each student prepares a 2-minute presentation about their hobby. Include what it is, how often they do it, why they enjoy it, and what they've learned. Q&A after each presentation.",
    practice: "Social Planning: In groups, students plan a weekend with 4 different activities. Must compromise and agree. Practice inviting ('Would you like to...'), accepting ('That sounds great'), and declining politely ('I'd love to, but...').",
    coolDown: "New Hobby Challenge: Students pick a random hobby card and explain to a partner why they would or wouldn't try it. Vote on the most adventurous person in class.",
    homework: "Try a new hobby this week (even for 15 minutes). Write about the experience: what you did, how you felt, would you do it again?"
  },
  {
    topicSlug: "sports-games", title: "Game On! Sports Talk",
    objectives: JSON.stringify(["Master sports vocabulary", "Describe rules and gameplay", "Express enthusiasm and disappointment", "Practice narrative tenses for sports events"]),
    materials: JSON.stringify(["Sports flashcards", "Sports commentary recordings", "Game rules handouts", "Scoreboard"]),
    warmUp: "Sports Quiz: Teams answer questions about sports (rules, famous athletes, records). Introduces vocabulary through fun competition.",
    mainActivity: "Sports Commentary Practice: Watch short sports clips (muted). Students provide live commentary using sports vocabulary. Then listen to real commentary and compare. Discuss new vocabulary and expressions.",
    practice: "Teach a Game: Each student teaches a sport or game from their country to their group. Must explain rules clearly using instruction language: 'First, you...', 'The aim is to...', 'You mustn't...'",
    coolDown: "Greatest Sporting Moment: Students share their favorite sports memory. Class votes on the most exciting story.",
    homework: "Watch a sports event (on TV or online) and write a short commentary (100 words). Include at least 8 sports vocabulary words."
  },
  {
    topicSlug: "shopping-fashion", title: "Style and Shopping Skills",
    objectives: JSON.stringify(["Learn shopping and fashion vocabulary", "Practice transactional language", "Describe clothing and style preferences", "Use comparatives and superlatives"]),
    materials: JSON.stringify(["Clothing picture cards", "Price tags and receipts", "Shop scenario cards", "Fashion magazine images"]),
    warmUp: "Fashion Show Commentary: Students describe what classmates are wearing using color, pattern, material vocabulary. Make it fun and positive.",
    mainActivity: "Shopping Role-Play: Set up different 'shops' in the classroom. Students practice buying, returning, asking about sizes, comparing prices. Rotate through different shops. Introduce vocabulary naturally through transactions.",
    practice: "Personal Stylist: Students become fashion advisors. They interview a partner about their style preferences, then recommend outfits using comparative language: 'This one is more formal than...', 'I think the blue one suits you better because...'",
    coolDown: "Best Deal Story: Students share their best shopping experience or biggest bargain. Class votes on the best story.",
    homework: "Look through a clothing website or magazine. Write descriptions of 5 outfits using at least 10 fashion vocabulary words."
  },
  {
    topicSlug: "music-entertainment", title: "The Sound of English",
    objectives: JSON.stringify(["Learn music and entertainment vocabulary", "Express preferences and opinions about music", "Describe emotions connected to music", "Practice adjectives and adverbs"]),
    materials: JSON.stringify(["Music genre cards", "Song lyrics handouts", "Emotion vocabulary posters", "Speaker for music"]),
    warmUp: "Musical Chairs with a Twist: Play music clips from different genres. When music stops, students describe the genre and how it made them feel. Introduces vocabulary for genres and emotions.",
    mainActivity: "Song Analysis Workshop: Listen to 2-3 songs with lyrics. Discuss vocabulary, meaning, and cultural context. Students share how the songs make them feel using emotion vocabulary. Then, groups create a playlist for a specific mood and present it.",
    practice: "Music Debate: Teams debate topics like 'Live concerts are better than streaming', 'Modern music is worse than classic music'. Practice expressing opinions strongly while respecting others' views.",
    coolDown: "Desert Island Songs: Students choose 3 songs they would take to a desert island and explain why. Share with a partner.",
    homework: "Find an English song you like. Write about why you like it, what the lyrics mean, and how it makes you feel (150 words)."
  },
  {
    topicSlug: "culture-traditions", title: "Cultural Kaleidoscope",
    objectives: JSON.stringify(["Learn vocabulary about culture and traditions", "Describe cultural practices respectfully", "Compare and contrast cultures", "Practice narrative and descriptive language"]),
    materials: JSON.stringify(["Cultural practice cards", "World map", "Festival photo collection", "Compare-contrast graphic organizers"]),
    warmUp: "Cultural Object Show and Tell: Students bring or describe an object that represents their culture. Others ask questions. Builds vocabulary and cultural understanding.",
    mainActivity: "Festival Presentations: Each student or pair presents a festival from their culture or a culture they admire. Include history, activities, food, and significance. Q&A after each. Teacher builds vocabulary on the board.",
    practice: "Cultural Exchange Cafe: Set up 'culture tables'. Students rotate between tables, sharing customs about greeting, eating, celebrating, and socializing. Practice phrases like 'In my culture, we...', 'It's customary to...'",
    coolDown: "Cultural Appreciation Circle: Students share one thing they learned about another culture today that they found interesting or beautiful.",
    homework: "Research a cultural tradition from a country you've never visited. Write about it and present it next class (150 words)."
  },
  {
    topicSlug: "home-housing", title: "Home Sweet Home",
    objectives: JSON.stringify(["Learn vocabulary for rooms, furniture, and housing", "Describe homes in detail", "Express preferences about living situations", "Practice prepositions of place"]),
    materials: JSON.stringify(["Room vocabulary flashcards", "House floor plan templates", "Real estate advertisement samples", "Preposition reference sheet"]),
    warmUp: "Room Drawing Race: Teacher describes a room in detail. Students draw what they hear. Compare drawings — closest to the description wins. Practices listening and spatial vocabulary.",
    mainActivity: "Dream Home Design: Students design their dream home on paper, labeling rooms and furniture. Present to partner using prepositions: 'next to', 'between', 'in the corner of'. Then pairs compare homes and find similarities.",
    practice: "House Hunting: Students role-play as real estate agents and buyers. Agents describe available properties, buyers ask questions and make decisions. Practice polite requests and housing vocabulary.",
    coolDown: "Home Sweet Home: Students describe their actual home to a partner. Partner draws a floor plan based on the description. Compare with reality.",
    homework: "Write a description of your ideal neighborhood and home (150 words). Include at least 10 housing vocabulary words."
  },
  {
    topicSlug: "transport-commuting", title: "Getting Around",
    objectives: JSON.stringify(["Master transport vocabulary", "Give and follow directions", "Discuss commuting experiences", "Practice imperatives and polite requests"]),
    materials: JSON.stringify(["City map handouts", "Transport mode cards", "Direction phrase reference", "Timer"]),
    warmUp: "Transport Survey: Students survey classmates about how they get to school/work. Create a class chart. Discuss the most popular modes. Introduces transport vocabulary.",
    mainActivity: "City Navigator: Using a map, students give and follow directions. Practice phrases like 'Turn left at...', 'Go straight until you reach...', 'Take the second right'. Partner follows directions and checks if they arrive at the right place.",
    practice: "Travel Planner: Groups plan a journey across their city/country using only public transport. Present the route, including times, costs, and transfers. Others ask questions and suggest alternatives.",
    coolDown: "Commuting Stories: Students share their most interesting, funny, or stressful commuting experience. Class votes on the best story.",
    homework: "Describe your daily commute in detail (100 words). Then describe your ideal commute and compare the two."
  },
  {
    topicSlug: "weather-seasons", title: "Weather Talk and Seasons",
    objectives: JSON.stringify(["Learn weather and season vocabulary", "Make small talk about weather", "Describe seasonal activities and preferences", "Practice future tenses for weather"]),
    materials: JSON.stringify(["Weather symbol cards", "Season activity pictures", "Weather forecast scripts", "Thermometer graphics"]),
    warmUp: "Weather Reporter: Students present a 30-second weather forecast for their city. Others guess the city. Introduces vocabulary in a fun performance context.",
    mainActivity: "Seasonal Discussion Carousel: Set up 4 stations (Spring, Summer, Autumn, Winter). Groups rotate, discussing activities, clothes, food, and feelings for each season. Record favorite vocabulary at each station. Share findings with class.",
    practice: "Weather Small Talk Practice: Students practice short weather conversations in different contexts: meeting a stranger, talking to a neighbor, starting a business meeting. Focus on natural, fluent exchanges.",
    coolDown: "Perfect Day: Students describe their perfect day weather-wise. What would they do? Where would they go? Share with a partner.",
    homework: "Write about your favorite season and explain why you prefer it. Compare it with your least favorite season (150 words)."
  },
  {
    topicSlug: "animals-pets", title: "Animal Kingdom Speaking Club",
    objectives: JSON.stringify(["Learn animal and pet vocabulary", "Describe animals using adjectives", "Discuss pet ownership and animal welfare", "Practice conditional sentences"]),
    materials: JSON.stringify(["Animal picture cards", "Pet care information sheets", "Animal quiz questions", "Habitat matching game"]),
    warmUp: "Animal Guessing Game: One student describes an animal without naming it. Others ask yes/no questions to guess. Practice question formation and animal vocabulary.",
    mainActivity: "Pet Debate: Teams debate topics like 'Keeping pets is unfair to animals', 'Zoos are necessary for conservation', 'Everyone should adopt, not shop'. Practice vocabulary while developing arguments.",
    practice: "Vet Clinic Role-Play: Students role-play as vets and pet owners. Practice describing symptoms, giving advice, and expressing concern. Rotate roles with different scenarios.",
    coolDown: "If I Were an Animal: Students describe which animal they would be and why. Vote on the most creative answer.",
    homework: "Research an endangered animal. Prepare a 2-minute presentation about it for next class."
  },
  {
    topicSlug: "money-finance", title: "Money Matters",
    objectives: JSON.stringify(["Learn financial vocabulary", "Discuss money management", "Practice giving financial advice", "Use conditionals for hypothetical situations"]),
    materials: JSON.stringify(["Budget planning worksheets", "Financial scenario cards", "Money vocabulary flashcards", "Calculator"]),
    warmUp: "Money Proverbs: Share proverbs about money ('Money doesn't grow on trees'). Students discuss meanings and share similar sayings from their culture.",
    mainActivity: "Budget Challenge: Groups receive a fictional monthly salary and must create a budget. Present and justify choices. Practice vocabulary like savings, expenses, budget, invest, afford. Compare approaches.",
    practice: "Financial Advisor Role-Play: Students take turns being financial advisors and clients. Clients present financial dilemmas, advisors give structured advice. Use vocabulary like investment, interest rate, debt, mortgage.",
    coolDown: "Million Dollar Question: If you had one million dollars, what would you do? Share and discuss. Practice second conditional naturally.",
    homework: "Track your spending for 3 days. Categorize expenses and write about where you could save money (150 words)."
  },
  {
    topicSlug: "dreams-ambitions", title: "Dream Big, Speak Boldly",
    objectives: JSON.stringify(["Learn vocabulary about goals and ambitions", "Describe future plans confidently", "Motivate and inspire others through speaking", "Practice future tenses and conditional forms"]),
    materials: JSON.stringify(["Goal-setting worksheets", "Inspirational quote cards", "Vision board materials", "Timer"]),
    warmUp: "Bucket List Sharing: Students share 3 items from their bucket list. Partners ask follow-up questions. Introduces vocabulary about ambitions and dreams.",
    mainActivity: "TED Talk Mini-Presentations: Students prepare and deliver 3-minute talks about their dreams, goals, or something they're passionate about. Structure: Hook, personal story, key message, call to action. Practice vocabulary and public speaking skills.",
    practice: "Goal-Setting Workshop: Students set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Share goals with a partner who asks challenging questions. Practice vocabulary: aspiration, milestone, perseverance, determination.",
    coolDown: "Letter to Future Self: Students write a short letter to themselves one year from now about their English learning goals. Seal in envelopes for next year.",
    homework: "Write about someone who inspires you and how they achieved their dreams (150 words). Use at least 8 vocabulary words from the lesson."
  },
  {
    topicSlug: "movies-tv", title: "Lights, Camera, Discussion!",
    objectives: JSON.stringify(["Learn film and TV vocabulary", "Describe plots and characters", "Express opinions about entertainment", "Practice narrative tenses"]),
    materials: JSON.stringify(["Movie poster collection", "Genre classification cards", "Film review templates", "Short film clips"]),
    warmUp: "Movie Emoji Challenge: Teacher shows emoji combinations representing movies. Students guess the title. Introduces genre and film vocabulary in a fun way.",
    mainActivity: "Film Critics Panel: Watch a short film clip together. Students become film critics, discussing plot, acting, music, and themes. Practice using film vocabulary: plot twist, soundtrack, cinematography, cast. Then each writes a mini-review.",
    practice: "Movie Pitch: Groups create an original movie concept. They pitch it to the class including genre, plot summary, main characters, and target audience. Class votes on which movie they would watch. Practice persuasive language.",
    coolDown: "Desert Island Movie: Each student picks the one movie they would take to a desert island and convinces a partner why it's the best choice.",
    homework: "Watch a movie or TV episode in English. Write a review (150 words) using at least 8 vocabulary words from class."
  },
];

// Speaking materials
const SPEAKING_MATERIALS = [
  {
    title: "Beginner Linking Words",
    category: "linking_words",
    levelRange: "beginner-elementary",
    content: `ADDING IDEAS: and, also, too, as well
GIVING REASONS: because, so
CONTRASTING: but, however
GIVING EXAMPLES: for example, like, such as
ORDERING: first, then, next, finally, after that
TIME: before, after, when, while, during
OPINION: I think, I believe, In my opinion`,
    order: 1,
  },
  {
    title: "Intermediate Linking Words",
    category: "linking_words",
    levelRange: "pre-intermediate-upper-intermediate",
    content: `ADDING: moreover, furthermore, in addition, besides, what is more
CONTRASTING: however, nevertheless, on the other hand, whereas, although, despite
CAUSE/EFFECT: consequently, therefore, as a result, due to, owing to
COMPARING: similarly, likewise, in the same way, compared to
EXAMPLES: for instance, in particular, specifically, to illustrate
CONCLUDING: in conclusion, to sum up, all in all, on the whole
EMPHASIS: indeed, in fact, certainly, without a doubt`,
    order: 2,
  },
  {
    title: "IELTS Advanced Linking Words",
    category: "linking_words",
    levelRange: "advanced-ielts",
    content: `SOPHISTICATED ADDITION: not only...but also, in light of, coupled with
NUANCED CONTRAST: notwithstanding, conversely, be that as it may, having said that
CONCESSION: admittedly, granted that, while it is true that
EMPHASIS: it is worth noting, significantly, paramount, undeniably
HEDGING: it could be argued that, arguably, to a certain extent, by and large
CAUSE/EFFECT: thereby, hence, this gives rise to, precipitating
QUALIFICATION: provided that, on the condition that, insofar as
CONCLUSION: taking everything into account, in the final analysis, ultimately`,
    order: 3,
  },
  {
    title: "Answer Templates: Personal Questions",
    category: "templates",
    levelRange: "beginner-elementary",
    content: `TEMPLATE 1 - Simple Opinion:
"I [like/enjoy/prefer] _____ because _____. For example, _____."

TEMPLATE 2 - Describing Habits:
"I usually _____ [frequency]. I do this because _____. It makes me feel _____."

TEMPLATE 3 - Talking About Preferences:
"I prefer _____ to _____ because _____. For instance, _____."

TEMPLATE 4 - Describing People:
"[Person] is very _____. They like to _____. I admire them because _____."

TEMPLATE 5 - Talking About Your Country:
"In my country, _____ is very popular/common. People usually _____. I think this is because _____."`,
    order: 4,
  },
  {
    title: "Answer Templates: Discussion Questions",
    category: "templates",
    levelRange: "intermediate-upper-intermediate",
    content: `TEMPLATE 1 - Giving Opinions:
"In my opinion, _____ because _____. Moreover, _____. For instance, _____."

TEMPLATE 2 - Comparing:
"While _____, _____. On the other hand, _____. However, I believe _____."

TEMPLATE 3 - Problem-Solution:
"One of the main problems is _____. This is caused by _____. To solve this, we could _____."

TEMPLATE 4 - Advantages & Disadvantages:
"There are several advantages of _____. Firstly, _____. Secondly, _____. However, there are also some drawbacks, such as _____."

TEMPLATE 5 - Future Predictions:
"I believe that in the future, _____ will _____. This is likely because _____. As a result, _____."`,
    order: 5,
  },
  {
    title: "IELTS Answer Templates",
    category: "templates",
    levelRange: "ielts",
    content: `PART 1 - Personal Response (30 seconds):
"Well, I'd say that _____. The main reason is _____. Having said that, _____."

PART 2 - Long Turn (2 minutes):
"I'd like to talk about _____. This [happened/relates to] _____. What made it [special/significant] was _____. Looking back, I feel _____. The reason this is important to me is _____."

PART 3 - Discussion (analytical):
"That's an interesting question. I think there are several perspectives on this. On one hand, _____. Conversely, _____. From my point of view, _____. This is supported by the fact that _____."

PART 3 - Abstract Discussion:
"This is a complex issue. It could be argued that _____. Nevertheless, _____. Taking everything into account, I would say that _____."`,
    order: 6,
  },
  {
    title: "How to Structure Your Answers",
    category: "structures",
    levelRange: "all",
    content: `THE STAR METHOD (for any question):
S - State your answer/opinion clearly
T - Tell why (give your reason)
A - Add an example
R - Round up (conclude briefly)

THE PEEL METHOD (for opinion questions):
P - Point: State your main point
E - Explain: Why do you think this?
E - Example: Give a specific example
L - Link: Connect back to the question

FOR COMPARISON QUESTIONS:
1. Identify similarities first
2. Discuss key differences
3. Give your personal preference
4. Explain why with an example

FOR PROBLEM-SOLUTION QUESTIONS:
1. Identify the problem clearly
2. Explain why it's a problem
3. Suggest 1-2 solutions
4. Evaluate which solution is best`,
    order: 7,
  },
  {
    title: "IELTS Speaking Structure Guide",
    category: "structures",
    levelRange: "ielts",
    content: `PART 1 STRUCTURE (20-30 second answers):
- Direct answer + reason + example
- Don't speak too much or too little
- Show natural fluency

PART 2 STRUCTURE (1-2 minute monologue):
Introduction: "I'd like to talk about..."
Point 1: Address first bullet point with detail
Point 2: Address second bullet point
Point 3: Address third bullet point
Conclusion: "The reason I chose this is..." / "Looking back..."
TIP: Use the 1-minute preparation time wisely. Write key words only.

PART 3 STRUCTURE (deeper discussion):
- Acknowledge the question
- Give your main opinion
- Support with 2 reasons or examples
- Consider the opposite view
- Conclude with a balanced statement

SCORING TIPS:
- Fluency: Speak at a natural pace. Pauses for thinking are OK.
- Vocabulary: Use topic-specific vocabulary and collocations
- Grammar: Mix simple and complex structures
- Pronunciation: Focus on clear word stress and intonation`,
    order: 8,
  },
  {
    title: "Speaking Success Tips for All Levels",
    category: "tips",
    levelRange: "all",
    content: `1. DON'T PANIC: It's okay to pause and think. Say "Let me think..." or "That's a good question..."

2. EXTEND YOUR ANSWERS: Never give one-word answers. Always add a reason or example.

3. USE EXAMPLES: Personal examples make your answers more interesting and natural.

4. PRACTICE DAILY: Even 5 minutes of speaking practice every day makes a big difference.

5. RECORD YOURSELF: Listen back and identify areas for improvement.

6. LEARN COLLOCATIONS: "Make a decision" (not "do a decision"). Natural word combinations improve fluency.

7. DON'T MEMORIZE SCRIPTS: Examiners can tell. Learn vocabulary and structures instead.

8. STAY ON TOPIC: Answer the question that was asked. Don't go off on tangents.

9. USE FILLERS NATURALLY: "Well...", "Actually...", "To be honest..." — these sound natural.

10. SMILE AND BE CONFIDENT: Your attitude affects your performance. Believe in yourself!`,
    order: 9,
  },
  {
    title: "Common Speaking Mistakes to Avoid",
    category: "tips",
    levelRange: "all",
    content: `GRAMMAR MISTAKES:
✗ "I am agree" → ✓ "I agree"
✗ "I am boring" → ✓ "I am bored"
✗ "I went to there" → ✓ "I went there"
✗ "He don't like" → ✓ "He doesn't like"
✗ "More better" → ✓ "Better" or "Much better"

VOCABULARY MISTAKES:
✗ "Make homework" → ✓ "Do homework"
✗ "Say me" → ✓ "Tell me"
✗ "Open the light" → ✓ "Turn on the light"
✗ "I have 20 years" → ✓ "I am 20 years old"

FLUENCY TIPS:
✗ Speaking too fast → ✓ Speak clearly at a moderate pace
✗ Long pauses without fillers → ✓ Use "Well...", "Let me see..."
✗ Repeating the question → ✓ Paraphrase or answer directly
✗ Only short answers → ✓ Always explain WHY

PRONUNCIATION FOCUS:
- Word stress matters: PHOtograph vs photoGRAPHy
- Sentence stress: emphasize KEY words
- Intonation: voice goes UP for questions, DOWN for statements`,
    order: 10,
  },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log("🌱 Starting seed...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.studentProgress.deleteMany();
  await prisma.quizResult.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.speakingQuestion.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.vocabulary.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.speakingMaterial.deleteMany();
  await prisma.user.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.level.deleteMany();

  // Create levels (batch)
  console.log("Creating levels...");
  await prisma.level.createMany({ data: LEVELS });
  const allLevels = await prisma.level.findMany();
  const levelRecords: Record<string, string> = {};
  for (const l of allLevels) levelRecords[l.slug] = l.id;

  // Create topics (batch)
  console.log("Creating topics...");
  await prisma.topic.createMany({ data: TOPICS });
  const allTopics = await prisma.topic.findMany();
  const topicRecords: Record<string, string> = {};
  for (const t of allTopics) topicRecords[t.slug] = t.id;

  // Batch-build vocabulary, quizzes, speaking questions, discussions
  const activeLevels = ["beginner", "elementary", "pre-intermediate", "intermediate", "upper-intermediate", "advanced", "ielts"];
  const vocabLevelMap: Record<string, string> = {
    beginner: "beginner", elementary: "beginner",
    "pre-intermediate": "intermediate", intermediate: "intermediate", "upper-intermediate": "intermediate",
    advanced: "ielts", ielts: "ielts",
  };

  const allVocabData: any[] = [];
  const allQuizData: any[] = [];
  const allQuestionData: any[] = [];
  const allDiscussionData: any[] = [];

  for (const topic of TOPICS) {
    console.log(`  Preparing: ${topic.icon} ${topic.name}...`);
    const vocab = ALL_VOCAB[topic.slug] || getDefaultVocab(topic.slug);

    for (const levelSlug of activeLevels) {
      const levelId = levelRecords[levelSlug];
      const topicId = topicRecords[topic.slug];
      const vocabKey = vocabLevelMap[levelSlug] as keyof TopicVocab;
      const vocabEntries = vocab[vocabKey];

      for (const [word, definition, exampleSentence, pronunciation, partOfSpeech] of vocabEntries) {
        allVocabData.push({ word, definition, exampleSentence, pronunciation, partOfSpeech, levelId, topicId });
      }

      const quizzes = generateQuizzes(vocabEntries, topic.name);
      for (let i = 0; i < quizzes.length; i++) {
        allQuizData.push({ ...quizzes[i], levelId, topicId, order: i + 1 });
      }

      const questions = generateSpeakingQuestions(topic.slug, topic.name, levelSlug);
      for (let i = 0; i < questions.length; i++) {
        allQuestionData.push({ ...questions[i], levelId, topicId, order: i + 1 });
      }

      const discussion = generateDiscussion(topic.name, levelSlug);
      allDiscussionData.push({ ...discussion, levelId, topicId });
    }
  }

  console.log(`Inserting ${allVocabData.length} vocabulary entries...`);
  await prisma.vocabulary.createMany({ data: allVocabData });

  console.log(`Inserting ${allQuizData.length} quiz questions...`);
  await prisma.quiz.createMany({ data: allQuizData });

  console.log(`Inserting ${allQuestionData.length} speaking questions...`);
  await prisma.speakingQuestion.createMany({ data: allQuestionData });

  console.log(`Inserting ${allDiscussionData.length} discussions...`);
  await prisma.discussion.createMany({ data: allDiscussionData });

  const totalVocab = allVocabData.length;
  const totalQuizzes = allQuizData.length;
  const totalQuestions = allQuestionData.length;
  const totalDiscussions = allDiscussionData.length;

  // Create lesson plans (batch)
  console.log("Creating lesson plans...");
  const lessonPlanData = LESSON_PLANS
    .filter((p: any) => topicRecords[p.topicSlug])
    .map(({ topicSlug, ...planData }: any) => ({ ...planData, topicId: topicRecords[topicSlug] }));
  await prisma.lessonPlan.createMany({ data: lessonPlanData });

  // Create speaking materials (batch)
  console.log("Creating speaking materials...");
  await prisma.speakingMaterial.createMany({ data: SPEAKING_MATERIALS });

  // Create reading passages
  console.log("Creating reading passages...");
  let totalReading = 0;
  // (reading data defined inline below)
  const readingTopics = ["travel-tourism", "food-cooking", "technology-internet", "environment-nature", "health-fitness", "education-learning", "work-career", "culture-traditions"];
  const readingData: Record<string, { title: string; passage: string; questions: { type: string; question: string; options: string; correctAnswer: string; explanation: string }[] }[]> = {
    "travel-tourism": [
      {
        title: "The Rise of Eco-Tourism",
        passage: "Eco-tourism has become one of the fastest-growing sectors in the travel industry. Unlike traditional tourism, eco-tourism focuses on responsible travel to natural areas that conserves the environment and improves the well-being of local people. Countries like Costa Rica, Kenya, and New Zealand have become leaders in eco-tourism, offering visitors unique experiences while protecting their natural heritage.\n\nThe concept emerged in the 1980s as travelers became more aware of the environmental impact of mass tourism. Hotels were built without regard for local ecosystems, and popular destinations suffered from overcrowding and pollution. Eco-tourism offered an alternative: smaller groups, locally owned accommodations, and activities that educated visitors about the natural world.\n\nToday, eco-tourists can stay in solar-powered lodges in the Amazon rainforest, go whale watching in Iceland, or trek through national parks in Tanzania. These experiences not only provide unforgettable memories but also fund conservation efforts and create jobs for local communities.\n\nHowever, critics argue that the term 'eco-tourism' is sometimes used as a marketing tool by companies that do little to actually protect the environment. This practice, known as 'greenwashing,' can mislead consumers and undermine genuine conservation efforts. To combat this, several certification programs have been established to verify that tourism operators meet strict environmental and social standards.",
        questions: [
          { type: "multiple_choice", question: "What is the main focus of eco-tourism?", options: JSON.stringify(["Making travel cheaper", "Responsible travel that protects the environment", "Building luxury hotels in natural areas", "Increasing the number of tourists"]), correctAnswer: "Responsible travel that protects the environment", explanation: "The passage states eco-tourism 'focuses on responsible travel to natural areas that conserves the environment.'" },
          { type: "multiple_choice", question: "When did the concept of eco-tourism emerge?", options: JSON.stringify(["1970s", "1980s", "1990s", "2000s"]), correctAnswer: "1980s", explanation: "The passage states 'The concept emerged in the 1980s.'" },
          { type: "multiple_choice", question: "What is 'greenwashing'?", options: JSON.stringify(["A type of eco-friendly cleaning", "Using eco-tourism as a false marketing tool", "Washing clothes in an environmentally friendly way", "Painting buildings green"]), correctAnswer: "Using eco-tourism as a false marketing tool", explanation: "The passage defines greenwashing as companies using the term 'eco-tourism' as 'a marketing tool' while doing 'little to actually protect the environment.'" },
        ],
      },
    ],
    "food-cooking": [
      {
        title: "The Science of Taste",
        passage: "For centuries, scientists believed that the human tongue could detect only four basic tastes: sweet, sour, salty, and bitter. However, in 1908, Japanese chemist Kikunae Ikeda identified a fifth taste, which he called 'umami,' meaning 'pleasant savory taste' in Japanese. Umami is the taste associated with foods like aged cheese, soy sauce, tomatoes, and mushrooms.\n\nThe discovery of umami revolutionized our understanding of flavor. We now know that taste is far more complex than previously thought. Each taste bud on your tongue contains 50 to 100 specialized receptor cells that can detect different taste molecules. When you eat, these receptors send signals to your brain, which combines them with information from your sense of smell to create what we perceive as flavor.\n\nInterestingly, about 80% of what we think of as taste actually comes from our sense of smell. This is why food seems tasteless when you have a cold. The aroma molecules from food travel through the back of your throat to your nasal cavity, where smell receptors process them. Without this olfactory input, you can only detect the basic tastes.\n\nRecent research has suggested that there may be even more basic tastes beyond the five we currently recognize. Some scientists believe that fat, calcium, and even water might have their own distinct taste receptors. If confirmed, these discoveries could change how we prepare and enjoy food.",
        questions: [
          { type: "multiple_choice", question: "Who discovered umami?", options: JSON.stringify(["A French chef", "Kikunae Ikeda", "A British scientist", "An Italian cook"]), correctAnswer: "Kikunae Ikeda", explanation: "The passage states 'Japanese chemist Kikunae Ikeda identified a fifth taste.'" },
          { type: "multiple_choice", question: "What percentage of taste comes from smell?", options: JSON.stringify(["About 50%", "About 60%", "About 80%", "About 90%"]), correctAnswer: "About 80%", explanation: "The passage states 'about 80% of what we think of as taste actually comes from our sense of smell.'" },
          { type: "multiple_choice", question: "Why does food seem tasteless during a cold?", options: JSON.stringify(["Taste buds stop working", "Smell receptors are blocked", "You eat less food", "Your tongue swells up"]), correctAnswer: "Smell receptors are blocked", explanation: "The passage explains that without olfactory (smell) input, 'you can only detect the basic tastes.'" },
        ],
      },
    ],
  };

  // Insert passages in batch, then fetch IDs for questions
  const passageInserts: any[] = [];
  const passageMetadata: { topicSlug: string; levelSlug: string; title: string; questions: any[] }[] = [];
  for (const topicSlug of readingTopics) {
    const topicId = topicRecords[topicSlug];
    if (!topicId) continue;
    const passages = readingData[topicSlug] || readingData["travel-tourism"];
    for (const levelSlug of ["beginner", "intermediate", "ielts"] as const) {
      const levelId = levelRecords[levelSlug];
      if (!levelId) continue;
      for (const pData of passages) {
        passageInserts.push({
          title: pData.title,
          passage: pData.passage,
          wordCount: pData.passage.split(/\s+/).length,
          levelId,
          topicId,
        });
        passageMetadata.push({ topicSlug, levelSlug, title: pData.title, questions: pData.questions });
      }
    }
  }
  await prisma.readingPassage.createMany({ data: passageInserts });
  // Fetch created passages to get IDs
  const createdPassages = await prisma.readingPassage.findMany({ select: { id: true, title: true, levelId: true, topicId: true } });
  const readingQuestionsData: any[] = [];
  for (const meta of passageMetadata) {
    const topicId = topicRecords[meta.topicSlug];
    const levelId = levelRecords[meta.levelSlug];
    const passage = createdPassages.find(p => p.title === meta.title && p.levelId === levelId && p.topicId === topicId);
    if (!passage) continue;
    for (let qi = 0; qi < meta.questions.length; qi++) {
      const q = meta.questions[qi];
      readingQuestionsData.push({
        type: q.type, question: q.question, options: q.options,
        correctAnswer: q.correctAnswer, explanation: q.explanation,
        order: qi + 1, passageId: passage.id,
      });
    }
    totalReading++;
  }
  await prisma.readingQuestion.createMany({ data: readingQuestionsData });

  // Create writing tasks
  console.log("Creating writing tasks...");
  const writingTaskData: { title: string; instructions: string; type: string; tips: string; wordCountMin: number; wordCountMax: number }[] = [
    { title: "My Favorite Place", instructions: "Write about your favorite place to visit. Describe what it looks like, why you like it, and how it makes you feel. Use descriptive adjectives.", type: "essay", tips: "Start with an introduction, use 'because' to give reasons, end with a conclusion.", wordCountMin: 80, wordCountMax: 150 },
    { title: "A Letter to a Friend", instructions: "Write a letter to a friend inviting them to visit your city. Tell them about interesting places and activities they can enjoy.", type: "letter", tips: "Start with 'Dear [Name]', include at least 3 suggestions, end with 'Looking forward to seeing you!'", wordCountMin: 100, wordCountMax: 200 },
    { title: "Advantages and Disadvantages of Technology", instructions: "Some people think technology makes life better, while others think it creates problems. Discuss both views and give your own opinion.", type: "essay", tips: "Structure: Introduction -> Advantages (2-3) -> Disadvantages (2-3) -> Your opinion -> Conclusion", wordCountMin: 150, wordCountMax: 250 },
    { title: "Describe a Graph", instructions: "The bar chart shows the number of students enrolled in different language courses at a university from 2018 to 2023. Summarize the information and make comparisons where relevant.", type: "report", tips: "Start with overview of main trends, then describe specific details. Use comparative language.", wordCountMin: 150, wordCountMax: 250 },
    { title: "Problem and Solution Essay", instructions: "Many cities around the world are facing problems with traffic congestion. What are the causes of this problem and what measures could be taken to solve it?", type: "essay", tips: "Paragraph 1: Introduction. Paragraph 2: Causes. Paragraph 3: Solutions. Paragraph 4: Conclusion.", wordCountMin: 200, wordCountMax: 300 },
  ];

  const allWritingData: any[] = [];
  for (const topicSlug of readingTopics) {
    const topicId = topicRecords[topicSlug];
    if (!topicId) continue;
    for (const levelSlug of ["beginner", "intermediate", "ielts"] as const) {
      const levelId = levelRecords[levelSlug];
      if (!levelId) continue;
      const taskIdx = ["beginner", "intermediate", "ielts"].indexOf(levelSlug);
      const tasks = writingTaskData.slice(taskIdx, taskIdx + 2);
      for (const task of tasks) {
        allWritingData.push({ ...task, levelId, topicId });
      }
    }
  }
  console.log(`Inserting ${allWritingData.length} writing tasks...`);
  await prisma.writingTask.createMany({ data: allWritingData });
  const totalWriting = allWritingData.length;

  // Create badges (batch)
  console.log("Creating badges...");
  const BADGES = [
    { name: "First Step", nameUz: "Birinchi qadam", nameRu: "Первый шаг", nameKo: "첫 걸음", description: "Complete your first quiz", descUz: "Birinchi testni yakunlang", descRu: "Завершите первый тест", descKo: "첫 번째 퀴즈를 완료하세요", icon: "🎯", criteria: "quiz_complete_1", category: "achievement" },
    { name: "Quiz Master", nameUz: "Test ustasi", nameRu: "Мастер тестов", nameKo: "퀴즈 마스터", description: "Score 100% on 10 quizzes", descUz: "10 ta testda 100% natija", descRu: "Наберите 100% в 10 тестах", descKo: "10개의 퀴즈에서 100% 달성", icon: "🏆", criteria: "quiz_perfect_10", category: "achievement" },
    { name: "Vocabulary King", nameUz: "Lug'at qiroli", nameRu: "Король лексики", nameKo: "어휘 왕", description: "Learn 500 words", descUz: "500 ta so'z o'rganing", descRu: "Изучите 500 слов", descKo: "단어 500개를 학습하세요", icon: "📚", criteria: "vocab_500", category: "achievement" },
    { name: "Speaking Star", nameUz: "Nutq yulduzi", nameRu: "Звезда говорения", nameKo: "말하기 스타", description: "Submit 50 speaking answers", descUz: "50 ta gapirish javobini yuboring", descRu: "Отправьте 50 разговорных ответов", descKo: "말하기 답변 50개를 제출하세요", icon: "🗣️", criteria: "speaking_50", category: "speaking" },
    { name: "Reading Pro", nameUz: "O'qish ustasi", nameRu: "Профи чтения", nameKo: "읽기 전문가", description: "Complete 20 reading passages", descUz: "20 ta o'qish matnini bajaring", descRu: "Завершите 20 текстов для чтения", descKo: "읽기 지문 20개를 완료하세요", icon: "📖", criteria: "reading_20", category: "reading" },
    { name: "Writing Expert", nameUz: "Yozish mutaxassisi", nameRu: "Эксперт письма", nameKo: "쓰기 전문가", description: "Submit 30 writing tasks", descUz: "30 ta yozma vazifa topshiring", descRu: "Отправьте 30 письменных заданий", descKo: "쓰기 과제 30개를 제출하세요", icon: "✍️", criteria: "writing_30", category: "writing" },
    { name: "7-Day Streak", nameUz: "7 kunlik ketma-ket", nameRu: "7 дней подряд", nameKo: "7일 연속", description: "Practice 7 days in a row", descUz: "7 kun ketma-ket mashq qiling", descRu: "Практикуйтесь 7 дней подряд", descKo: "7일 연속 학습하세요", icon: "🔥", criteria: "streak_7", category: "streak" },
    { name: "30-Day Streak", nameUz: "30 kunlik ketma-ket", nameRu: "30 дней подряд", nameKo: "30일 연속", description: "Practice 30 days in a row", descUz: "30 kun ketma-ket mashq qiling", descRu: "Практикуйтесь 30 дней подряд", descKo: "30일 연속 학습하세요", icon: "💎", criteria: "streak_30", category: "streak" },
    { name: "Competition Winner", nameUz: "Musobaqa g'olibi", nameRu: "Победитель соревнования", nameKo: "대회 우승자", description: "Win a SpeakWise competition", descUz: "SpeakWise musobaqasida g'olib bo'ling", descRu: "Победите в соревновании SpeakWise", descKo: "SpeakWise 대회에서 우승하세요", icon: "⚔️", criteria: "competition_win", category: "competition" },
    { name: "Perfect Score", nameUz: "Mukammal natija", nameRu: "Идеальный результат", nameKo: "완벽한 점수", description: "Score 100% on a full level assessment", descUz: "To'liq daraja baholashida 100%", descRu: "Наберите 100% в полном уровневом задании", descKo: "전체 레벨 평가에서 100% 달성", icon: "⭐", criteria: "perfect_level", category: "achievement" },
  ];
  await prisma.badge.createMany({ data: BADGES });

  // Create competitions (batch)
  console.log("Creating competitions...");
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoMonthsLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  await prisma.competition.createMany({
    data: [
      { title: "Monthly Quiz Challenge", description: "Complete as many quizzes as possible this month. Top 3 scorers win special badges!", type: "monthly", startDate: now, endDate: oneMonthLater, isActive: true, prize: "Gold Badge + Featured on Leaderboard" },
      { title: "Vocabulary Sprint", description: "Learn the most vocabulary words in 30 days. Each word learned earns 1 point!", type: "monthly", startDate: now, endDate: twoMonthsLater, isActive: true, prize: "Vocabulary King Badge" },
      { title: "Last Month Speaking Star", description: "Submit the best speaking answers as judged by teachers.", type: "monthly", startDate: oneMonthAgo, endDate: now, isActive: false, prize: "Speaking Star Badge" },
    ],
  });

  // Create resources (batch)
  console.log("Creating resources...");
  const RESOURCES = [
    { title: "IELTS Speaking Band Descriptors", description: "Official IELTS speaking assessment criteria explained in detail.", type: "pdf", url: "https://www.ielts.org/for-researchers/speaking-band-descriptors", category: "ielts", examType: "ielts", order: 1 },
    { title: "English with Lucy (YouTube)", description: "Popular YouTube channel for British English pronunciation and grammar.", type: "youtube", url: "https://www.youtube.com/c/EnglishwithLucy", category: "youtube", examType: "general", order: 2 },
    { title: "BBC Learning English", description: "Free English learning resources from the BBC including videos, grammar, and vocabulary.", type: "website", url: "https://www.bbc.co.uk/learningenglish", category: "website", examType: "general", order: 3 },
    { title: "IELTS Liz (YouTube)", description: "Comprehensive IELTS preparation videos covering all four skills.", type: "youtube", url: "https://www.youtube.com/user/iabormeux", category: "ielts", examType: "ielts", order: 4 },
    { title: "Cambridge Dictionary", description: "Comprehensive English dictionary with pronunciation, examples, and translations.", type: "website", url: "https://dictionary.cambridge.org", category: "vocabulary", examType: "general", order: 5 },
    { title: "TED Talks for English Learners", description: "Inspiring talks with subtitles — great for listening practice and expanding vocabulary.", type: "youtube", url: "https://www.ted.com/talks", category: "listening", examType: "general", order: 6 },
    { title: "IELTS Academic Writing Task 1 Guide", description: "Step-by-step guide to describing graphs, charts, and diagrams for IELTS.", type: "guide", url: "#", category: "ielts", examType: "ielts", order: 7 },
    { title: "Grammarly Blog", description: "Practical grammar tips, writing techniques, and vocabulary building articles.", type: "website", url: "https://www.grammarly.com/blog", category: "writing", examType: "general", order: 8 },
  ];
  await prisma.resource.createMany({ data: RESOURCES });

  // Create demo users
  console.log("Creating demo users...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);
  await prisma.user.createMany({
    data: [
      { email: "admin@speakwise.com", password: adminPassword, name: "Teacher Admin", role: "admin", level: "ielts" },
      { email: "student@speakwise.com", password: studentPassword, name: "Demo Student", role: "student", level: "intermediate", points: 350, streak: 5 },
    ],
  });

  console.log("\n Seed complete!");
  console.log(`   ${totalVocab} vocabulary entries`);
  console.log(`   ${totalQuizzes} quiz questions`);
  console.log(`   ${totalQuestions} speaking questions`);
  console.log(`   ${totalDiscussions} discussions`);
  console.log(`   ${totalReading} reading passages`);
  console.log(`   ${totalWriting} writing tasks`);
  console.log(`   ${BADGES.length} badges`);
  console.log(`   3 competitions`);
  console.log(`   ${RESOURCES.length} resources`);
  console.log(`   ${LESSON_PLANS.length} lesson plans`);
  console.log(`   ${SPEAKING_MATERIALS.length} speaking materials`);
  console.log(`   2 demo users (admin@speakwise.com / student@speakwise.com)`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
