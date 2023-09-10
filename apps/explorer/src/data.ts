export const PLAYS = [
  { txid: '4JvKmGCbanuZrjtFSWGt5XiN7zy2Q4RAmGeFn3sDLHjDgwLJxELXnNNdbfym3J7CvnYjE73e78yQRoJGbXg4swj7', profit: 0.35, multiplier: 7 },
  { txid: '3M8Cz8EPuGasThGiZB81XotY4prAzxz2uj3FpBRZWpAwgbg5Hddqq8aFYvRYifLMCQrP2ffSFUk6N3UiZtVsDUE3', profit: -0.25, multiplier: 0 },
  { txid: '2D2dTDzcpi92JVrHfyLxeAe3RdMEVc895852RrzXFonJdp7dowGmw8xJ1Zfxmbz4q15QKzcTexngGXrRHnqYC72M', profit: 0.1, multiplier: 2 },
  { txid: '5skcoEBo8DrwoJT7St33WjBfMbh2icEo6mtgGNikd4FSjHzfMHKH199x8fjBLG8qwf5Ncq6mETs66XavvS2KV7rq', profit: .2, multiplier: 2 },
  { txid: '5K4mAXjhJEcGK6U2DBG8oobLRidNDWr3Sgcc19NaAVBDScEiGymBPicYvE72gBbFyU4uh6FMeK8MBCxvUKgrWxL2', profit: 0.142, multiplier: 1.263 },
]

export const POOLS = [
  {
    name: 'Solana',
    symbol: 'SOL',
    liquidity: 1420.3,
    volume: 800.3,
  },
  {
    name: 'Guacamole',
    symbol: 'GUAC',
    liquidity: 820.3,
    volume: 220.3,
  },
]

export const CREATORS = [
  {
    address: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
    volume: 2548.54,
    meta: { name: 'Gamba Demo' },
  },
  {
    address: 'EjJxmSmbBdYu8Qu2PcpK8UUnBAmFtGEJpWFPrQqHgUNC',
    volume: 1081.27,
    meta: { name: 'Guacamole' },
  },
  {
    address: '3wHhNeDcK69AsPQnFJ6buzA15y8MtdTmX2zkDEABr7c7',
    volume: 111.52,
  },
  {
    address: '399KgE5gpzFvBB8arZLxA2bes3n4FY7rTMmzifHohPzx',
    volume: 18.38,
  },
]

export interface DailyVolume {
  date: string
  total_volume: number
}


export const DAILY_VOLUME: DailyVolume[] = [{
  date: '2023-03-23',
  total_volume: 1957499999,
},
{
  date: '2023-03-24',
  total_volume: 72500000,
},
{
  date: '2023-03-27',
  total_volume: 1610000000,
},
{
  date: '2023-03-28',
  total_volume: 459999999,
},
{
  date: '2023-03-30',
  total_volume: 1209999996,
},
{
  date: '2023-03-31',
  total_volume: 1049999986,
},
{
  date: '2023-04-02',
  total_volume: 179999998,
},
{
  date: '2023-04-03',
  total_volume: 1286814538,
},
{
  date: '2023-04-04',
  total_volume: 6815450238,
},
{
  date: '2023-04-05',
  total_volume: 1488081007,
},
{
  date: '2023-04-06',
  total_volume: 3228347935,
},
{
  date: '2023-04-07',
  total_volume: 1707536956,
},
{
  date: '2023-04-08',
  total_volume: 930000000,
},
{
  date: '2023-04-09',
  total_volume: 52596327570,
},
{
  date: '2023-04-10',
  total_volume: 3748581090,
},
{
  date: '2023-04-11',
  total_volume: 1020000000,
},
{
  date: '2023-04-12',
  total_volume: 175000000,
},
{
  date: '2023-04-13',
  total_volume: 699689996,
},
{
  date: '2023-04-14',
  total_volume: 819749667,
},
{
  date: '2023-04-15',
  total_volume: 8223593650,
},
{
  date: '2023-04-16',
  total_volume: 91920309885,
},
{
  date: '2023-04-17',
  total_volume: 1139433480,
},
{
  date: '2023-04-18',
  total_volume: 517616452,
},
{
  date: '2023-04-19',
  total_volume: 585049992,
},
{
  date: '2023-04-20',
  total_volume: 1860000000,
},
{
  date: '2023-04-21',
  total_volume: 9420000000,
},
{
  date: '2023-04-22',
  total_volume: 80000000,
},
{
  date: '2023-04-23',
  total_volume: 1100073873,
},
{
  date: '2023-04-24',
  total_volume: 220000000,
},
{
  date: '2023-04-25',
  total_volume: 9229999988,
},
{
  date: '2023-04-26',
  total_volume: 4466597744,
},
{
  date: '2023-04-27',
  total_volume: 2410883500,
},
{
  date: '2023-04-28',
  total_volume: 2468252520,
},
{
  date: '2023-04-29',
  total_volume: 33368184087,
},
{
  date: '2023-04-30',
  total_volume: 1470000000,
},
{
  date: '2023-05-01',
  total_volume: 4499542550,
},
{
  date: '2023-05-02',
  total_volume: 17381797052,
},
{
  date: '2023-05-03',
  total_volume: 28010566898,
},
{
  date: '2023-05-04',
  total_volume: 225236862178,
},
{
  date: '2023-05-05',
  total_volume: 95773855452,
},
{
  date: '2023-05-06',
  total_volume: 96504993742,
},
{
  date: '2023-05-07',
  total_volume: 1154927481,
},
{
  date: '2023-05-08',
  total_volume: 4256251119,
},
{
  date: '2023-05-09',
  total_volume: 900657013,
},
{
  date: '2023-05-10',
  total_volume: 839309179,
},
{
  date: '2023-05-11',
  total_volume: 690000000,
},
{
  date: '2023-05-12',
  total_volume: 40000000,
},
{
  date: '2023-05-13',
  total_volume: 1863451595,
},
{
  date: '2023-05-14',
  total_volume: 540000000,
},
{
  date: '2023-05-15',
  total_volume: 219999999,
},
{
  date: '2023-05-16',
  total_volume: 27930000000,
},
{
  date: '2023-05-17',
  total_volume: 930000000,
},
{
  date: '2023-05-18',
  total_volume: 210000000,
},
{
  date: '2023-05-19',
  total_volume: 7236159695,
},
{
  date: '2023-05-20',
  total_volume: 1305167858,
},
{
  date: '2023-05-21',
  total_volume: 370000000,
},
{
  date: '2023-05-22',
  total_volume: 1728789847,
},
{
  date: '2023-05-23',
  total_volume: 237000000,
},
{
  date: '2023-05-24',
  total_volume: 1040657019,
},
{
  date: '2023-05-25',
  total_volume: 334249000,
},
{
  date: '2023-05-26',
  total_volume: 1104927537,
},
{
  date: '2023-05-27',
  total_volume: 140000000,
},
{
  date: '2023-05-28',
  total_volume: 300000000,
},
{
  date: '2023-05-29',
  total_volume: 2095569542,
},
{
  date: '2023-05-30',
  total_volume: 8353845622,
},
{
  date: '2023-05-31',
  total_volume: 1639496228,
},
{
  date: '2023-06-01',
  total_volume: 751720819,
},
{
  date: '2023-06-02',
  total_volume: 13918781969,
},
{
  date: '2023-06-03',
  total_volume: 726194892,
},
{
  date: '2023-06-04',
  total_volume: 199999998,
},
{
  date: '2023-06-05',
  total_volume: 2899347073,
},
{
  date: '2023-06-06',
  total_volume: 4837314838,
},
{
  date: '2023-06-07',
  total_volume: 1458029789,
},
{
  date: '2023-06-08',
  total_volume: 610000000,
},
{
  date: '2023-06-09',
  total_volume: 373307110,
},
{
  date: '2023-06-10',
  total_volume: 284927536,
},
{
  date: '2023-06-11',
  total_volume: 494592831,
},
{
  date: '2023-06-12',
  total_volume: 40000000,
},
{
  date: '2023-06-13',
  total_volume: 2366236716,
},
{
  date: '2023-06-14',
  total_volume: 80000000,
},
{
  date: '2023-06-15',
  total_volume: 4220513974,
},
{
  date: '2023-06-16',
  total_volume: 7936714993,
},
{
  date: '2023-06-17',
  total_volume: 80000000,
},
{
  date: '2023-06-18',
  total_volume: 1734492759,
},
{
  date: '2023-06-19',
  total_volume: 120000000,
},
{
  date: '2023-06-20',
  total_volume: 31780000000,
},
{
  date: '2023-06-21',
  total_volume: 1685927535,
},
{
  date: '2023-06-23',
  total_volume: 1641803778,
},
{
  date: '2023-06-24',
  total_volume: 430000000,
},
{
  date: '2023-06-25',
  total_volume: 241545895,
},
{
  date: '2023-06-26',
  total_volume: 96618358,
},
{
  date: '2023-06-27',
  total_volume: 6094236716,
},
{
  date: '2023-06-28',
  total_volume: 871256043,
},
{
  date: '2023-06-29',
  total_volume: 1409632240,
},
{
  date: '2023-06-30',
  total_volume: 144927537,
},
{
  date: '2023-07-01',
  total_volume: 289855074,
},
{
  date: '2023-07-02',
  total_volume: 50000000,
},
{
  date: '2023-07-03',
  total_volume: 1009234380,
},
{
  date: '2023-07-04',
  total_volume: 9999996,
},
{
  date: '2023-07-05',
  total_volume: 6186102762,
},
{
  date: '2023-07-06',
  total_volume: 2279999986,
},
{
  date: '2023-07-07',
  total_volume: 5629745271,
},
{
  date: '2023-07-08',
  total_volume: 219999997,
},
{
  date: '2023-07-09',
  total_volume: 406618327,
},
{
  date: '2023-07-10',
  total_volume: 69999995,
},
{
  date: '2023-07-11',
  total_volume: 1003236715,
},
{
  date: '2023-07-12',
  total_volume: 2242660996,
},
{
  date: '2023-07-13',
  total_volume: 2348309179,
},
{
  date: '2023-07-14',
  total_volume: 307184883127,
},
{
  date: '2023-07-15',
  total_volume: 30789999999,
},
{
  date: '2023-07-16',
  total_volume: 4000000000,
},
{
  date: '2023-07-17',
  total_volume: 65382161522,
},
{
  date: '2023-07-18',
  total_volume: 30957796159,
},
{
  date: '2023-07-19',
  total_volume: 215342683801,
},
{
  date: '2023-07-20',
  total_volume: 76034015191,
},
{
  date: '2023-07-21',
  total_volume: 26499506182,
},
{
  date: '2023-07-22',
  total_volume: 154888316689,
},
{
  date: '2023-07-23',
  total_volume: 236688776337,
},
{
  date: '2023-07-24',
  total_volume: 32685132460,
},
{
  date: '2023-07-25',
  total_volume: 16451603775,
},
{
  date: '2023-07-26',
  total_volume: 46773737044,
},
{
  date: '2023-07-27',
  total_volume: 31121738846,
},
{
  date: '2023-07-28',
  total_volume: 1849999993,
},
{
  date: '2023-07-29',
  total_volume: 6415484036,
},
{
  date: '2023-07-30',
  total_volume: 41052305647,
},
{
  date: '2023-07-31',
  total_volume: 25359952971,
},
{
  date: '2023-08-01',
  total_volume: 30540332292,
},
{
  date: '2023-08-02',
  total_volume: 83589673941,
},
{
  date: '2023-08-03',
  total_volume: 9172367155,
},
{
  date: '2023-08-04',
  total_volume: 171762235240,
},
{
  date: '2023-08-05',
  total_volume: 4480000000,
},
{
  date: '2023-08-06',
  total_volume: 7864602786,
},
{
  date: '2023-08-07',
  total_volume: 45414763449,
},
{
  date: '2023-08-08',
  total_volume: 24699963769,
},
{
  date: '2023-08-09',
  total_volume: 43854637661,
},
{
  date: '2023-08-10',
  total_volume: 19879999905,
},
{
  date: '2023-08-11',
  total_volume: 7720772885,
},
{
  date: '2023-08-12',
  total_volume: 56926530977,
},
{
  date: '2023-08-13',
  total_volume: 361449994174,
},
{
  date: '2023-08-14',
  total_volume: 5274637668,
},
{
  date: '2023-08-15',
  total_volume: 550000000,
},
{
  date: '2023-08-16',
  total_volume: 1270772947,
},
{
  date: '2023-08-17',
  total_volume: 9599915272,
},
{
  date: '2023-08-18',
  total_volume: 8463237749,
},
{
  date: '2023-08-19',
  total_volume: 3259999836,
},
{
  date: '2023-08-20',
  total_volume: 2700000000,
},
{
  date: '2023-08-21',
  total_volume: 970772948,
},
{
  date: '2023-08-22',
  total_volume: 2743144475,
},
{
  date: '2023-08-23',
  total_volume: 5288436371,
},
{
  date: '2023-08-24',
  total_volume: 2732801933,
},
{
  date: '2023-08-25',
  total_volume: 6805984849,
},
{
  date: '2023-08-26',
  total_volume: 550000000,
},
{
  date: '2023-08-27',
  total_volume: 2049999937,
},
{
  date: '2023-08-28',
  total_volume: 12700000000,
},
{
  date: '2023-08-29',
  total_volume: 55200000000,
},
{
  date: '2023-08-30',
  total_volume: 8213740439,
},
{
  date: '2023-08-31',
  total_volume: 20999678614,
},
{
  date: '2023-09-01',
  total_volume: 55617186154,
},
{
  date: '2023-09-02',
  total_volume: 4284075371,
},
{
  date: '2023-09-03',
  total_volume: 349999990,
},
{
  date: '2023-09-04',
  total_volume: 123939304069,
},
{
  date: '2023-09-05',
  total_volume: 44224076083,
},
{
  date: '2023-09-06',
  total_volume: 31138695653,
},
{
  date: '2023-09-07',
  total_volume: 29927229576,
},
{
  date: '2023-09-08',
  total_volume: 315304205836,
},
{
  date: '2023-09-09',
  total_volume: 49962373854,
},
]
