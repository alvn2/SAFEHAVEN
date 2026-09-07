import { prisma } from './db.js';

export const AFRICAN_KENYAN_QUOTES: { text: string; author: string }[] = [
  // --- Kenyan & Swahili Proverbs (with English Translations) ---
  { text: "Haba na haba, hujaza kibaba. (Little by little, the measure is filled. Healing happens one small step at a time.)", author: "Swahili Proverb" },
  { text: "Mvumilivu hula mbivu. (The patient one eats the ripe fruit.)", author: "Swahili Proverb" },
  { text: "Kuteleza si kuanguka, bali ni kwenda mbele. (To slip is not to fall, but to stumble forward.)", author: "Swahili Proverb" },
  { text: "Subira yavuta heri. (Patience attracts blessing and peace.)", author: "Swahili Proverb" },
  { text: "Giza totoro la usiku ndilo tangazo la mapambazuko. (The thickest darkness of the night is the announcement of dawn.)", author: "Swahili Wisdom" },
  { text: "Haraka haraka haina baraka; pumzika na uweke moyo wako sawa. (Rushing brings no blessing; breathe and calm your heart.)", author: "Swahili Proverb" },
  { text: "Mti mkuu ukigwa, ndege hutunga viota pengine. (When a great tree falls, birds build nests anew. There is always a way forward.)", author: "Kenyan Proverb" },
  { text: "Kikwazo cha leo ndiyo ngazi ya kesho. (Today's obstacle is tomorrow's stepping stone.)", author: "Swahili Proverb" },
  { text: "Maji yakimwagika hayazoleki, lakini kisima kingali kina maji safi. (Spilled water cannot be gathered, but the well still holds clean water.)", author: "Kenyan Saying" },
  { text: "Uzito wa mzigo huonekana kwa mbebaji, lakini mkono wa jirani hupunguza uzito. (The burden is heavy to the one carrying it, but a neighbor's helping hand lightens the load.)", author: "Swahili Wisdom" },
  { text: "Moyo wa kupenda hauna hila. (A heart full of compassion holds no malice. Treat yourself with compassion.)", author: "Swahili Proverb" },
  { text: "Kilio cha mbali hakizuii usingizi, lakini sauti ya rafiki huamsha tumaini. (A distant cry may fade, but a friend's voice brings living hope.)", author: "Kenyan Proverb" },
  { text: "Penye nia pana njia. (Where there is a will, there is always a way.)", author: "Swahili Proverb" },
  { text: "Kawia ufike. (Better to delay and arrive safely than to perish in haste.)", author: "Swahili Proverb" },
  { text: "Umoja ni nguvu, utengano ni udhaifu. (Unity is strength, division is weakness.)", author: "Kenyan National Motto" },
  { text: "Hakuna msiba usio na mwenziwe, lakini pia hakuna dhiki isiyo na faraja. (No grief is solitary, and no hardship comes without its comfort.)", author: "Swahili Proverb" },
  { text: "Damu nzito kuliko maji, lakini udugu wa roho hauna mipaka. (Kinship of the spirit knows no borders.)", author: "Swahili Proverb" },
  { text: "Baada ya dhiki, faraja. (After hardship, relief and ease will arrive.)", author: "Swahili Proverb" },
  { text: "Mchumia juani hulia kivulini. (One who toils in the sun will rest and rejoice in the shade.)", author: "Swahili Proverb" },
  { text: "Mcheza kwao hutuzwa. (Honor your roots and give grace to your journey.)", author: "Swahili Proverb" },

  // --- Kikuyu, Luo, Luhya, Maasai, Kamba, Kalenjin & Meru Traditions ---
  { text: "Mwaki wa ng'ondu ndunogaga. (The gentle fire of the soul never tires; peace returns quietly.)", author: "Kikuyu Proverb" },
  { text: "Gutiri uriraga ta mundu uri wiki. (No one cries harder than someone who feels alone. Reach out; you are not alone.)", author: "Kikuyu Proverb" },
  { text: "Kanyua weriire; ciugo njega nicio thiguku ya ngoro. (Speak your truth safely; good words are a feast for the wounded soul.)", author: "Kikuyu Wisdom" },
  { text: "Kik ile maber onge giko. (What is truly good has no end; hope endures.)", author: "Luo Proverb" },
  { text: "Piny nene ok ochwe e ndalo achiel. (The world was not created in a single day; be gentle with your healing.)", author: "Luo Proverb" },
  { text: "Ng'ama ohero chunye konyo jowadgi. (One who values their own inner peace brings solace to those around them.)", author: "Luo Wisdom" },
  { text: "Omulala mulala, babiri babiri; amani kali mu bukhwe. (Alone you are one, together we are a shield.)", author: "Luhya Proverb" },
  { text: "Inzila ndambi yikhinganga omulafu. (A long road still leads to the bright open light.)", author: "Luhya Proverb" },
  { text: "Meeta olchorro le meidim aaiturur engishu. (Even the smallest stream helps water the herd; every quiet breath counts.)", author: "Maasai Proverb" },
  { text: "Enkanyit eng'eno; empurronoto enyeisho olkereti. (Respect and quiet patience are the root of enduring wisdom.)", author: "Maasai Proverb" },
  { text: "Ore oloing'oni lemeiturur, eitururr eng'eno. (A calm mind gathers wisdom that fury scatters.)", author: "Maasai Wisdom" },
  { text: "Kavola kavola nikyo kuthi na mbee. (Slowly, step by step, is how the journey is won.)", author: "Kamba Proverb" },
  { text: "Mwana wa muntu athiaga na njira yonthe akimenyereire. (A traveler walks with care, honoring each step of the path.)", author: "Meru Proverb" },
  { text: "Kiyai kiyai ng'oo chemongin. (Gentle patience brings calm to the troubled water.)", author: "Kalenjin Proverb" },
  { text: "Hadaad nabad weydo, naftaadu ma degto. (Without inner peace, the soul cannot rest. Seek peace within first.)", author: "Somali Proverb (Kenya/Horn of Africa)" },
  { text: "Nin daad qaaday xumbo cuskay. (A person caught in a flood grasps even for foam; do not be ashamed to grasp for help.)", author: "Somali Proverb" },

  // --- Renowned Kenyan Thinkers & Leaders ---
  { text: "It’s the little things citizens do. That’s what will make the difference. My little thing is planting trees.", author: "Prof. Wangari Maathai (Kenyan Nobel Peace Prize Laureate)" },
  { text: "You cannot protect the environment without empowering people, and you cannot empower people without giving them hope.", author: "Prof. Wangari Maathai" },
  { text: "In the course of history, there comes a time when humanity is called to shift to a new level of consciousness.", author: "Prof. Wangari Maathai" },
  { text: "When we plant trees, we plant the seeds of peace and seeds of hope for tomorrow.", author: "Prof. Wangari Maathai" },
  { text: "Our task is not to remember the past with bitterness, but to build our future with courage and unity.", author: "Jomo Kenyatta" },
  { text: "Language is the carrier of a people's culture and wisdom. Guard the thoughts that shape your soul.", author: "Ngũgĩ wa Thiong'o (Kenyan Author)" },
  { text: "To be human is to belong to a community, and in that community, nobody should struggle in silence.", author: "Kenyan Community Wisdom" },
  { text: "No runner finishes a marathon by sprinting the first kilometer. Pace yourself with grace.", author: "Eldoret Running Wisdom" },
  { text: "Only the person who has traveled through the dry desert truly appreciates the cool shade of the acacia.", author: "Kenyan Savannah Proverb" },

  // --- Pan-African Proverbs & Philosophies ---
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
  { text: "However long the night, the dawn will break.", author: "African Proverb" },
  { text: "The sun does not forget a village just because it is small.", author: "African Proverb" },
  { text: "Smooth seas do not make skillful sailors.", author: "African Proverb" },
  { text: "When branches quarrel, their roots embrace beneath the earth.", author: "African Proverb" },
  { text: "Rain beats a leopard's skin, but it does not wash out the spots. You cannot erase your past, but you can choose your future.", author: "African Proverb" },
  { text: "A tree cannot make a forest, but a single tree can offer welcome shade to the weary traveler.", author: "African Proverb" },
  { text: "The lion does not turn around when a small dog barks. Protect your peace from everyday noise.", author: "African Proverb" },
  { text: "Even the mightiest eagle must land and rest its wings upon the earth.", author: "African Proverb" },
  { text: "Do not look where you fell, but where you slipped.", author: "Liberian Proverb" },
  { text: "Patience can cook a stone into porridge.", author: "African Proverb" },
  { text: "Where water is the boss, the land must obey. Yield to the seasons of your heart.", author: "African Proverb" },
  { text: "The heart of the wise man lies quiet like limpid water.", author: "Cameroonian Proverb" },
  { text: "Cross the river in a crowd and the crocodile won't eat you. Seek companionship in your trials.", author: "Madagascar Proverb" },
  { text: "A patient person will eat well-cooked porridge.", author: "Ugandan Proverb" },
  { text: "The axe forgets what the tree remembers; give yourself time to heal from wounds others never noticed.", author: "Zimbabwean Proverb" },
  { text: "Hold a true friend with both hands.", author: "Nigerian Proverb" },
  { text: "A person is a person through other persons (Ubuntu).", author: "Bantu / South African Philosophy" },
  { text: "If you are filled with pride, then you will have no room for wisdom.", author: "African Proverb" },
  { text: "No matter how full the river, it still wants to grow. Give yourself room to evolve.", author: "Congolese Proverb" },
  { text: "Wisdom does not come overnight; it arrives drop by drop like morning dew upon the grass.", author: "Ghanaian Proverb" },
  { text: "A child who is not embraced by the village will burn it down to feel its warmth. Let us embrace each other.", author: "African Proverb" },
  { text: "When the drumbeat changes, the dance must also change. Adapt gently to life's transitions.", author: "Nigerian Proverb" },
  { text: "Do not call the forest that sheltered you a jungle.", author: "Ghanaian Proverb" },
  { text: "Words are like spears: once loosed, they cannot be called back. Speak kindly to yourself.", author: "African Proverb" },
  { text: "A bird does not sing because it has answers, it sings because it has a song.", author: "African Wisdom" },
  { text: "He who conceals his illness can find no medicine for his cure.", author: "Ethiopian Proverb" },
  { text: "In the garden of gentle speech, seeds of peace bloom without thorns.", author: "Sudanese Proverb" },
  { text: "The moon moves slowly, but it crosses the entire sky.", author: "Ghanaian Proverb" },
  { text: "Teeth may bite the tongue, but they still remain together in the mouth. Forgive yourself for mistakes.", author: "African Proverb" },
  { text: "You cannot build a house on someone else's foundation; discover your own grounding.", author: "Rwandan Proverb" },
  { text: "When you stand with the earth, the sky never falls upon your shoulders alone.", author: "Senegalese Proverb" },
  { text: "Even a small ant can carry a burden twice its size when its heart is brave.", author: "Tanzanian Proverb" },
  { text: "Water that has been boiled will still return to cool water. Anger and anxiety will also pass.", author: "African Proverb" },
  { text: "A river cuts through rock not because of its power, but because of its persistence.", author: "African Wisdom" },
  { text: "The footprint of the elephant obliterates the footprints of all other animals; big courage covers all fears.", author: "African Proverb" },
  { text: "Hope is the pillar of the world.", author: "Kano / Hausa Proverb" },
  { text: "Resting is not quitting; even the sun sets so it may rise with greater radiance.", author: "African Proverb" },
  { text: "A peaceful heart sees beauty even in the thorniest bush.", author: "African Proverb" },

  // --- African Thinkers, Writers & Peacebuilders ---
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "May your choices reflect your hopes, not your fears.", author: "Nelson Mandela" },
  { text: "There is no passion to be found playing small—in settling for a life that is less than the one you are capable of living.", author: "Nelson Mandela" },
  { text: "Do not judge me by my successes, judge me by how many times I fell down and got back up again.", author: "Nelson Mandela" },
  { text: "Hope is being able to see that there is light despite all of the darkness.", author: "Archbishop Desmond Tutu" },
  { text: "My humanity is bound up in yours, for we can only be human together.", author: "Archbishop Desmond Tutu" },
  { text: "Differences are not intended to separate, to alienate. We are different precisely in order to realize our need of one another.", author: "Archbishop Desmond Tutu" },
  { text: "If you don't like someone's story, write your own.", author: "Chinua Achebe" },
  { text: "Nobody can teach you who you are. You would have to discover that for yourself.", author: "Chinua Achebe" },
  { text: "One of the truest tests of integrity is its blunt refusal to be compromised.", author: "Chinua Achebe" },
  { text: "You cannot carry out fundamental change without a certain amount of madness—the madness of daring to invent the future.", author: "Thomas Sankara" },
  { text: "To love oneself is the beginning of a lifelong romance with peace.", author: "African Reflection" },
  { text: "Education is the premise of progress, in every society, in every family.", author: "Kofi Annan (Former UN Secretary-General)" },
  { text: "To live is to choose. But to choose well, you must know who you are and what you stand for.", author: "Kofi Annan" },
  { text: "If your dreams do not scare you, they are not big enough.", author: "Ellen Johnson Sirleaf (First female African Head of State)" },
  { text: "A man who does not know where the rain began to beat him cannot know where he dried his body.", author: "Chinua Achebe" },
  { text: "Never let your fear decide your future.", author: "African Mental Health Wisdom" },
  { text: "Vulnerability is not weakness; it is the truest courage there is.", author: "African Counseling Collective" },
  { text: "Healing begins the moment someone hears you and believes your pain.", author: "African Peer Support Circle" },
  { text: "A seed does not boast of the forest within it; it just quietly grows.", author: "African Wisdom" },
  { text: "The eye that has wept sees more clearly.", author: "African Proverb" },
  { text: "Calmness is the cradle of strength.", author: "African Reflection" },
  { text: "When you pray for rain, you must also be ready to deal with the mud. Growth involves discomfort.", author: "African Proverb" },
  { text: "The elephant does not limp when walking on thorns; it walks with mindful steps.", author: "African Proverb" },
  { text: "In times of hardship, the quietest hand that reaches out speaks the loudest.", author: "African Wisdom" },
  { text: "A home is built of bricks and stones; a peaceful mind is built of patience and self-forgiveness.", author: "African Proverb" },
  { text: "A bird perched on a branch is never afraid of the branch breaking, because its trust is not in the branch, but in its wings.", author: "African Proverb" },
  { text: "A single gentle word can warm three winter months.", author: "African Saying" },
  { text: "Do not let what you cannot do interfere with what you can do right now.", author: "African Proverb" },
  { text: "One candle loses nothing by lighting another.", author: "African Wisdom" },
  { text: "Wisdom is like a baobab tree; no one person's arms can embrace it all.", author: "Ghanaian Proverb" },
  { text: "He who asks questions cannot avoid the answers that liberate him.", author: "Cameroonian Proverb" },
  { text: "Knowledge without wisdom is like water poured upon sand.", author: "Guinean Proverb" },
  { text: "The river may dry up, but the riverbed remembers its course.", author: "African Proverb" },
  { text: "Even the tallest eucalyptus tree started from a seed as tiny as dust.", author: "Kenyan Reforestation Wisdom" },
  { text: "Give light, and the darkness will vanish of itself.", author: "African Proverb" },
  { text: "If you carry the egg of peace in your hand, walk carefully so it does not break.", author: "Yoruba Proverb" },
  { text: "When the heart is at peace, the body finds its health.", author: "African Proverb" }
];

export const QUOTES_200: { text: string; author: string }[] = AFRICAN_KENYAN_QUOTES;


async function seedAfricanQuotes() {
  console.log(`🌱 Seeding ${AFRICAN_KENYAN_QUOTES.length} African & Kenyan proverbs into SafeHaven database...\n`);
  
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) admin = await prisma.user.findFirst();
  if (!admin) {
    console.error('No admin user found. Please check database connectivity.');
    return;
  }

  // Clear existing duplicate quotes or check count
  const existing = await prisma.quoteSuggestion.findMany({ select: { text: true } });
  const existingSet = new Set(existing.map(q => q.text));

  const missing = AFRICAN_KENYAN_QUOTES.filter(q => !existingSet.has(q.text));
  if (missing.length > 0) {
    await prisma.quoteSuggestion.createMany({
      data: missing.map(q => ({
        text: q.text,
        author: q.author,
        submittedById: admin.id,
        status: 'APPROVED'
      })),
      skipDuplicates: true
    });
    console.log(`✅ Successfully inserted ${missing.length} African and Kenyan proverbs.`);
  } else {
    console.log('All African proverbs already present in database.');
  }

  const finalCount = await prisma.quoteSuggestion.count({ where: { status: 'APPROVED' } });
  console.log(`Total approved wisdom quotes in DB: ${finalCount}`);
}

seedAfricanQuotes()
  .catch(e => { console.error('Error seeding quotes:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
