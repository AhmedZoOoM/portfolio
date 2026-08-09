/* Canonical public portfolio data. Source inventory: data/drive-inventory.json. */
(() => {
  const sourceFolderUrl = "https://drive.google.com/drive/folders/1M-fwHszneqa2h0xoZhImtVKoBZdmAMP9";
  const sources = [
  {
    "driveId": "1XahedVA2AfhI9dL71OwIQHLwB541uw2P",
    "sourcePath": "Drive root/CIB PARTY.mp4",
    "originalTitle": "CIB PARTY.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1Gi0vvuqKsfuLoXOs5pGKdud3Vsjjg09H",
    "sourcePath": "Drive root/مبادرة سائق واع لطريق آمن - الشركة القابضة للنقل البحري والبري (1080p, h264).mp4",
    "originalTitle": "مبادرة سائق واع لطريق آمن - الشركة القابضة للنقل البحري والبري (1080p, h264).mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1QuwhZeMIujn7IA9mUAKesgK9XYGYl6Me",
    "sourcePath": "Drive root/BTS_ADIB.mp4",
    "originalTitle": "BTS_ADIB.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1mdSSSoBcsVBeXds9XSb6PcSySx85xmHu",
    "sourcePath": "Drive root/Yasmine Atef_Art Director Showreel.mp4",
    "originalTitle": "Yasmine Atef_Art Director Showreel.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1G9TkkOLqVmIpe5z2soskOUwkYy2XNy9e",
    "sourcePath": "Drive root/Youssef Baroud- DOP Showreel.mp4",
    "originalTitle": "Youssef Baroud- DOP Showreel.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1b1M5rGf5GDWsa_ZJoUV5Bu5xq2-oRYZz",
    "sourcePath": "Drive root/Al Plateau Promo 01 - The Mummyالبرومو الثانى لبرنامج البلاتوه مع احمد امين  المومياء.mp4",
    "originalTitle": "Al Plateau Promo 01 - The Mummyالبرومو الثانى لبرنامج البلاتوه مع احمد امين  المومياء.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1UYUhj6zwbKfDHJeTUfFewKuG9pPHz1Op",
    "sourcePath": "Drive root/EVA26SEC.mp4",
    "originalTitle": "EVA26SEC.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "18YVkMN7yL8bSKhTKzCAQVmbF2KthT_2m",
    "sourcePath": "Drive root/Al Plateau Promo 01 - Al Koffar  البرومو الأول لبرنامج البلاتوه مع أحمد أمين - الكفار.mp4",
    "originalTitle": "Al Plateau Promo 01 - Al Koffar  البرومو الأول لبرنامج البلاتوه مع أحمد أمين - الكفار.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1ATtx_waJsppDwkRpFIIwswTx23DIpLFN",
    "sourcePath": "Drive root/Feras Zayn Producer's Showreel.mp4",
    "originalTitle": "Feras Zayn Producer's Showreel.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1l1fp1vS7Cof5HksJ43ITiVb7r8Mv2A8h",
    "sourcePath": "Drive root/Almarai The Making of.mp4",
    "originalTitle": "Almarai The Making of.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1Cz1J0y9WeeBCiWTF-rMeTK_GbPfrz8SN",
    "sourcePath": "Drive root/The Fisherman_Final.mp4",
    "originalTitle": "The Fisherman_Final.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1-c4zI1ed1SyZPT17siB0VBM5e7VmC1M_",
    "sourcePath": "Drive root/Halwani Bros.mp4",
    "originalTitle": "Halwani Bros.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1-bsU5PpCL_BExaZ_5UVrHau4Nv_mW2GE",
    "sourcePath": "Drive root/MORO.mp4",
    "originalTitle": "MORO.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1fkTaFyGEjbjT2OOVhy_6r9MV3sMMDqrR",
    "sourcePath": "Automatest/AI in the different stages of Testing.mp4",
    "originalTitle": "AI in the different stages of Testing.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1tawIBasEJNMJLQIa8meny1xO-Tyz8NeD",
    "sourcePath": "Automatest/AI in the different stages of Testing.png",
    "originalTitle": "AI in the different stages of Testing.png",
    "mimeType": "image/png"
  },
  {
    "driveId": "1OV0Tn1SW6SRAfyZlnRNGlMhHwKDzQPuU",
    "sourcePath": "Automatest/Comparing Agentic AI Providers Today.mp4",
    "originalTitle": "Comparing Agentic AI Providers Today.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1d9UemDIMuT4ewHYmaRiVaFTn_AqOzdNj",
    "sourcePath": "Automatest/Comparing Agentic AI Providers Today.png",
    "originalTitle": "Comparing Agentic AI Providers Today.png",
    "mimeType": "image/png"
  },
  {
    "driveId": "1rGWZe3YszCd6ONJHPjKKcq0h3XJLhhSJ",
    "sourcePath": "Automatest/Upgrading from Native to SHAFT.mp4",
    "originalTitle": "Upgrading from Native to SHAFT.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "15iKdRxoCwJHvRj33LdOhjrq28F4bTNQD",
    "sourcePath": "Automatest/Upgrading from Native to SHAFT.png",
    "originalTitle": "Upgrading from Native to SHAFT.png",
    "mimeType": "image/png"
  },
  {
    "driveId": "1eWqfzn0aoVnf5jaFN8TM-lVEgsNAiWdy",
    "sourcePath": "Automatest/How To Use Shaft Engine.mp4",
    "originalTitle": "How To Use Shaft Engine.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "14u5al-eUXe2-gFKEBA6A-cE16s6jF_S3",
    "sourcePath": "Automatest/How To Use Shaft Engine.png",
    "originalTitle": "How To Use Shaft Engine.png",
    "mimeType": "image/png"
  },
  {
    "driveId": "1UeE0bPFDZCmEHz21MBE9fClbU7UpSm9q",
    "sourcePath": "8Dominos/Comparison Trap.mp4",
    "originalTitle": "Comparison Trap.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1212EYYU6YOuGNxExp5CSWz-aO__QxQPA",
    "sourcePath": "8Dominos/The Habbit You've been meaning to quit.mp4",
    "originalTitle": "The Habbit You've been meaning to quit.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1ybVqPl7bmr6odOZC-em2ufvRRduXldgR",
    "sourcePath": "8Dominos/Your Marriage Isn't a Business.mp4",
    "originalTitle": "Your Marriage Isn't a Business.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1_664B7ud9xgY1y9RlcklgiZhxLPgMROu",
    "sourcePath": "8Dominos/No One is Coming To Save You.mp4",
    "originalTitle": "No One is Coming To Save You.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "18UHCdDM8SBhZpBns-zr9o04QuA45FjkQ",
    "sourcePath": "8Dominos/Why Effort Fails.mp4",
    "originalTitle": "Why Effort Fails.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1SrftQTChnW6wkSoohQgMZbVEiUCG0hoq",
    "sourcePath": "8Dominos/How I Gamfied My Life.mp4",
    "originalTitle": "How I Gamfied My Life.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1mapFYn8X5e9iJXKaj7_M21_g16o2V1hq",
    "sourcePath": "8Dominos/The Future You Isn’t Raising Your Kids.mp4",
    "originalTitle": "The Future You Isn’t Raising Your Kids.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1vWG9eDP1XUDNIZ47cnmCYZWjPOkkAjB7",
    "sourcePath": "8Dominos/Therapy.mp4",
    "originalTitle": "Therapy.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "179l3Zh-0KT3MlHiLPO_zb4JxPItcI0C9",
    "sourcePath": "8Dominos/Pressure doesnt mean progress.mp4",
    "originalTitle": "Pressure doesnt mean progress.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1PIGYWkNQvg1GHHAGEpn3M0hdVQi-iLLx",
    "sourcePath": "8Dominos_Reels/Comparison Disguise.mp4",
    "originalTitle": "Comparison Disguise.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "14EwiJn7Tkwm41yaGHS-LtAaqOJsHXm9R",
    "sourcePath": "8Dominos_Reels/The Loop of Comparison.mp4",
    "originalTitle": "The Loop of Comparison.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1kk7vjnKqmiuxSgG2yLiJvBp9Cck_Tm2o",
    "sourcePath": "8Dominos_Reels/Choose her over and over.mp4",
    "originalTitle": "Choose her over and over.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1QXVhCTXMFLf8XnhUES00sk2Qyje-a_4F",
    "sourcePath": "8Dominos_Reels/8 Dominios (LOVE).mp4",
    "originalTitle": "8 Dominios (LOVE).mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1guw2cKrKA6COs7TtI7N-q3uJQMlYkvQY",
    "sourcePath": "8Dominos_Reels/About the relief.mp4",
    "originalTitle": "About the relief.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1FO7kD_1Dn8kIr4Zvlv7TLLS8TEw66ZS2",
    "sourcePath": "8Dominos_Reels/The men i respect the most.mp4",
    "originalTitle": "The men i respect the most.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1Cj3z3JJstzuagbCMI5e8-TfkZYxIfoas",
    "sourcePath": "8Dominos_Reels/The Waiting Room.mp4",
    "originalTitle": "The Waiting Room.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1IV5OLhJOw5ZjTPdD-qHHirsI12-Fgujo",
    "sourcePath": "8Dominos_Reels/This is why just stop.mp4",
    "originalTitle": "This is why just stop.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1ArORCQFtm93EB6ov_BFdC_aRc--DvEOk",
    "sourcePath": "8Dominos_Reels/Effort Works Most of the Time.mp4",
    "originalTitle": "Effort Works Most of the Time.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1BVYge_M8Vl-T4yTn5sCTnmACsGQsVvMg",
    "sourcePath": "8Dominos_Reels/8 Categories.mp4",
    "originalTitle": "8 Categories.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "17SUKr-UOWkZWZcwE0jmsNXlv7sC_IInd",
    "sourcePath": "8Dominos_Reels/Clarity.mp4",
    "originalTitle": "Clarity.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1RsfgmHNW21EQ1qiJpOS1pgHA0mBYcWDK",
    "sourcePath": "8Dominos_Reels/NUMBERS.mp4",
    "originalTitle": "NUMBERS.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1z4bfUj9o3Xi11PHNUcwKvYF4QY8iAUGB",
    "sourcePath": "8Dominos_Reels/SCORING YOUR LIFE.mp4",
    "originalTitle": "SCORING YOUR LIFE.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "10xRr5eeOeBCUt2b4z-zyZ41gD5PhYKjG",
    "sourcePath": "8Dominos_Reels/Question.mp4",
    "originalTitle": "Question.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "13T_Impcw-sEAkAngVBgF4DonxEkK7axR",
    "sourcePath": "8Dominos_Reels/Your children wont inherit your best moments.mp4",
    "originalTitle": "Your children wont inherit your best moments.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1OhOs3k5XiLVBcqMx98gJrv2HvDr3Ks52",
    "sourcePath": "8Dominos_Reels/kids access to you right now.mp4",
    "originalTitle": "kids access to you right now.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1id59AoE0YnXjZhF9hzMHR2lyQ1awWKfy",
    "sourcePath": "8Dominos_Reels/Hidden.mp4",
    "originalTitle": "Hidden.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1xYqKEePwF3b2wUWIt-uSw3mYcQHvnMwb",
    "sourcePath": "8Dominos_Reels/Performance.mp4",
    "originalTitle": "Performance.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1Vq-xqpI8pwHvDG9Gi6D6zPMV-nkZPYmq",
    "sourcePath": "8Dominos_Reels/Success.mp4",
    "originalTitle": "Success.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1JPUxmfLsMxsko-k9ZIQ6tE_veQMrz-L5",
    "sourcePath": "Nahark Eswed Reels/REEL_EP04_Cats and dogs.mp4",
    "originalTitle": "REEL_EP04_Cats and dogs.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1_HWw9bG1Ji0aJ5Moqm6YtPiHBYAgWKbR",
    "sourcePath": "Nahark Eswed Reels/REEL_ep04_iced earth.mp4",
    "originalTitle": "REEL_ep04_iced earth.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1z-86lR5eFpofjBldVj3IRGukzdQeD2ll",
    "sourcePath": "Nahark Eswed Reels/REEL_EP04_1.5of2.mp4",
    "originalTitle": "REEL_EP04_1.5of2.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "17ZVTcu9YXwnRwTyyV7VB-SpDsofYfqm0",
    "sourcePath": "Nahark Eswed Reels/REEL_ep04_Sabaton1of2.mp4",
    "originalTitle": "REEL_ep04_Sabaton1of2.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1ZvfOwIFw1Im-bkpu7OH3Nio15OE5zzsK",
    "sourcePath": "Nahark Eswed Reels/REEL_ep04_Sabaton 2of2.mp4",
    "originalTitle": "REEL_ep04_Sabaton 2of2.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1n0hvlX9ccj7y-f4QNmxVu1xEVEf4EM6X",
    "sourcePath": "Nahark Eswed Reels/REEL_Ep3_Metal for every occasion.mp4",
    "originalTitle": "REEL_Ep3_Metal for every occasion.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "10nnHOyMkd30t1t3Cz-CZyp_YrG28EzTH",
    "sourcePath": "Nahark Eswed Reels/REEL_Ep3_MeccaZendeeq.mp4",
    "originalTitle": "REEL_Ep3_MeccaZendeeq.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1HjhmjWOfIKjmC0J4O5T5pSuL-LUSzsnq",
    "sourcePath": "Nahark Eswed Reels/REEL_Ep3_3arabi mafeesh content.mp4",
    "originalTitle": "REEL_Ep3_3arabi mafeesh content.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "19V_4QAuBpJ23GXBrfkso0azIec2gJqsI",
    "sourcePath": "Nahark Eswed Reels/REEL_5U50Zornheym.mp4",
    "originalTitle": "REEL_5U50Zornheym.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1SebLrCrM7wNnkW1mKJ7TpKCJGS9CSiCf",
    "sourcePath": "Nahark Eswed Reels/REEL_5U50_small_bands_investment.mp4",
    "originalTitle": "REEL_5U50_small_bands_investment.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1KPM0RhbLhJrwv_4l_77xREHjP0ziE1Ri",
    "sourcePath": "Nahark Eswed Reels/REEL_5U50intro.mp4",
    "originalTitle": "REEL_5U50intro.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1Wvpo4btKW0Nr8x884SXouJgFT2AhNr9x",
    "sourcePath": "Nahark Eswed Reels/REEL_Mo3anatELSharayet.mp4",
    "originalTitle": "REEL_Mo3anatELSharayet.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1BMmVecr0atGwoDCzNPuE7a8PopZUJ4U8",
    "sourcePath": "Nahark Eswed Reels/REEL_BlackSabathFirstListen.mp4",
    "originalTitle": "REEL_BlackSabathFirstListen.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "17jJIh4_gU3OEzNs2hFKdmTC4sZEQ0WyE",
    "sourcePath": "Nahark Eswed Reels/REEL_OmarFestivalEurope.mp4",
    "originalTitle": "REEL_OmarFestivalEurope.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "14QDMVIdDJO6jVTzt5PbcrFviXL2-J-r3",
    "sourcePath": "ADIB EGYPT REELS/ولسه المفاجآت مخلصتش! مستنيينكم كل جمعة وسبت مع ADIB Egypt، علشان لو انت من عملائنا… يبقى ليك م.mp4",
    "originalTitle": "ولسه المفاجآت مخلصتش! مستنيينكم كل جمعة وسبت مع ADIB Egypt، علشان لو انت من عملائنا… يبقى ليك م.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1zbt8WfnVRzv3cxuLlPJY0b752jQXqMPz",
    "sourcePath": "ADIB EGYPT REELS/_ده كان رأي عملائنا في تجربتهم معانا… قولنا رأيك في الكومنتات .رقم التسجيل الضريبي 204900255#رأ.mp4",
    "originalTitle": "_ده كان رأي عملائنا في تجربتهم معانا… قولنا رأيك في الكومنتات .رقم التسجيل الضريبي 204900255#رأ.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1dgKEIm4H05faD3zPFlniZJGOYalMpBIw",
    "sourcePath": "ADIB EGYPT REELS/و لسا المفاجآت مخلصتش … استنونا في عروض أكتر من ADIB-Egyptتطبق الشروط والأحكامرقم التسجيل الضريب.mp4",
    "originalTitle": "و لسا المفاجآت مخلصتش … استنونا في عروض أكتر من ADIB-Egyptتطبق الشروط والأحكامرقم التسجيل الضريب.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1hNxQBVJ8-gjVFfw2aohgCqSYU1q4IggV",
    "sourcePath": "ADIB EGYPT REELS/“ده كان رأي عملائنا في تجربتهم معانا…قولنا رأيك في الكومنتات  #رأيك_يهمنا #صوت_عملائنا”#ADIB_Egy.mp4",
    "originalTitle": "“ده كان رأي عملائنا في تجربتهم معانا…قولنا رأيك في الكومنتات  #رأيك_يهمنا #صوت_عملائنا”#ADIB_Egy.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "16xqFDV8O-T3Tv_3Rfbm07W2i8Z2mf9Pl",
    "sourcePath": "ADIB EGYPT REELS/ولسه المفاجآت مخلصتش! مستنيينكم كل جمعة وسبت مع ADIB-Egypt ، علشان لو إنت من عملائنا… يبقى ليك .mp4",
    "originalTitle": "ولسه المفاجآت مخلصتش! مستنيينكم كل جمعة وسبت مع ADIB-Egypt ، علشان لو إنت من عملائنا… يبقى ليك .mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1hhzDwr-cT4J5ppEDQ3cs-vEsPiqZtPCQ",
    "sourcePath": "ADIB EGYPT REELS/ولسه المفاجآت مخلصتش! مستنيينكم كل جمعة وسبت مع ADIB Egypt، علشان لو إنت من عملائنا… يبقى ليك م.mp4",
    "originalTitle": "ولسه المفاجآت مخلصتش! مستنيينكم كل جمعة وسبت مع ADIB Egypt، علشان لو إنت من عملائنا… يبقى ليك م.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1p4h0NBK8J4oPm8XCxpTyNl59oTO40yEe",
    "sourcePath": "Enty Asl El Hekaya/الحلقة الرابعة ｜｜ بودكاست أنتِ أصل الحكاية.mp4",
    "originalTitle": "الحلقة الرابعة ｜｜ بودكاست أنتِ أصل الحكاية.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "16kl-TkbvU090UNE0v2GnmIBiq5-bbbEt",
    "sourcePath": "Enty Asl El Hekaya/الحلقة الثالثة ｜｜ بودكاست أنتِ أصل الحكاية.mp4",
    "originalTitle": "الحلقة الثالثة ｜｜ بودكاست أنتِ أصل الحكاية.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "17AowvP6cMvmD0yhEehTEPM7CKsGh7s2_",
    "sourcePath": "Enty Asl El Hekaya/الحلقة الاولي ｜｜ بودكاست أنتِ أصل الحكاية.mp4",
    "originalTitle": "الحلقة الاولي ｜｜ بودكاست أنتِ أصل الحكاية.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "15eUSAjrLff5zu9MVdm6vn7CHnGQujNDi",
    "sourcePath": "Enty Asl El Hekaya/الحلقة الثانية ｜｜ بودكاست أنتِ أصل الحكاية.mp4",
    "originalTitle": "الحلقة الثانية ｜｜ بودكاست أنتِ أصل الحكاية.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "15YChyA-GE6dfKDI_D_-meJTK2DWLvIm_",
    "sourcePath": "The Shock/الموضوع عن عمالة الأطفال..ماذا لو حدث أمامك هذا الموقف؟! ‫#الصدمة‬.mp4",
    "originalTitle": "الموضوع عن عمالة الأطفال..ماذا لو حدث أمامك هذا الموقف؟! ‫#الصدمة‬.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1UgWm2DQ5vzTJm4c2UrIiRFjPxjDTAj-7",
    "sourcePath": "The Shock/الحلقة 11 من برنامج الصدمة - شاهد كيف تعامل الناس مع زوج يضرب زوجته في مكان عام.mp4",
    "originalTitle": "الحلقة 11 من برنامج الصدمة - شاهد كيف تعامل الناس مع زوج يضرب زوجته في مكان عام.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1zf_t2s08GSs_EhND_5m3HFsSpeaZCoNU",
    "sourcePath": "The Shock/برنامج الصدمة – الحلقة 1 - مفيش حد وحش.. رد فعل مؤثر وإنساني من المارة في الشارع.mp4",
    "originalTitle": "برنامج الصدمة – الحلقة 1 - مفيش حد وحش.. رد فعل مؤثر وإنساني من المارة في الشارع.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1nvNNWIvHKLiPzAAROgvZK9xC-MeOSAnz",
    "sourcePath": "The Shock/بعد إهانة الإبن لـ الأب.. كان لازم نتدخل!.mp4",
    "originalTitle": "بعد إهانة الإبن لـ الأب.. كان لازم نتدخل!.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1-aKQ0XYCg0QQs-HRzcwntWSWdNTRilVQ",
    "sourcePath": "The Shock/برنامج الصدمة - عماله الاطفال",
    "originalTitle": "برنامج الصدمة - عماله الاطفال",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1MFUEo63OmpZO7hlqWbx7CLEJZT42KLRW",
    "sourcePath": "Instagram Reels/Degwy.mp4",
    "originalTitle": "Degwy.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1-Byc7Fkkm2BMZ9LrqAsvuxd-e9kTy0cw",
    "sourcePath": "Instagram Reels/EVA Massage colored.mp4",
    "originalTitle": "EVA Massage colored.mp4",
    "mimeType": "video/mp4"
  },
  {
    "driveId": "1FvgBZ_-vcHRbzFwY0DYi3uj71hl_P4tI",
    "sourcePath": "Instagram Reels/JOJO.mp4",
    "originalTitle": "JOJO.mp4",
    "mimeType": "video/mp4"
  }
];

  const projectDetails = {
    "Drive root": { id: "selected-edits", title: "Selected edits", category: "commercial", summary: "Editorial, commercial, showreel, and making-of work supplied in the source archive." },
    "Automatest": { id: "automatest", title: "Automatest", category: "commercial", summary: "Technical and product-focused edits and accompanying stills." },
    "8Dominos": { id: "8dominos", title: "8Dominos", category: "commercial", summary: "Long-form campaign edits." },
    "8Dominos_Reels": { id: "8dominos-reels", title: "8Dominos reels", category: "social", summary: "Vertical social edits from the 8Dominos collection." },
    "Nahark Eswed Reels": { id: "nahark-eswed-reels", title: "Nahark Eswed reels", category: "social", summary: "Vertical social edits from the Nahark Eswed collection." },
    "ADIB EGYPT REELS": { id: "adib-egypt-reels", title: "ADIB Egypt reels", category: "social", summary: "Vertical social edits supplied in the ADIB Egypt collection." },
    "Enty Asl El Hekaya": { id: "enty-asl-el-hekaya", title: "Enty Asl El Hekaya", category: "television", summary: "Podcast episode edits." },
    "The Shock": { id: "the-shock", title: "The Shock", category: "television", summary: "Programme segments from برنامج الصدمة." },
    "Instagram Reels": { id: "instagram-reels", title: "Instagram reels", category: "social", summary: "Short-form social edits." }
  };

  const hasArabic = (text) => /[\u0600-\u06ff]/.test(text);
  const cleanTitle = (title) => title.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const projectFor = (sourcePath) => Object.keys(projectDetails).find((name) => sourcePath.startsWith(name + "/"));
  const media = sources.map((source) => {
    const projectName = projectFor(source.sourcePath);
    const project = projectDetails[projectName];
    const isImage = source.mimeType.startsWith("image/");
    const isSocial = project.category === "social";
    const title = cleanTitle(source.originalTitle);
    const category = isImage ? "stills" : /showreel/i.test(source.originalTitle) ? "showreel" : /(BTS|Making of)/i.test(source.originalTitle) ? "making-of" : project.category;
    return {
      driveId: source.driveId,
      sourcePath: source.sourcePath,
      originalTitle: source.originalTitle,
      displayTitle: title,
      kind: isImage ? "image" : "video",
      aspect: isSocial ? "portrait" : "landscape",
      language: hasArabic(title) ? (/[A-Za-z]/.test(title) ? "mixed" : "ar") : "en",
      dir: hasArabic(title) ? "rtl" : "ltr",
      variantGroup: project.id,
      provider: "drive",
      providerId: null,
      playbackUrl: isImage ? null : "https://drive.usercontent.google.com/download?id=" + source.driveId + "&export=download&confirm=t",
      posterUrl: "https://drive.google.com/thumbnail?id=" + source.driveId + "&sz=w1200",
      originalUrl: "https://drive.google.com/file/d/" + source.driveId + "/view",
      captionState: isImage ? "not-applicable" : "unavailable",
      ariaLabel: (isImage ? "Open image: " : "Play video: ") + title,
      credits: "Credits not specified in the source material.",
      rightsNote: "Shown for professional demonstration; rights remain with their respective owners.",
      projectId: project.id,
      category
    };
  });

  const projects = Object.values(projectDetails).map((project) => ({
    ...project,
    media: media.filter((item) => item.projectId === project.id)
  }));

  window.PORTFOLIO_DATA = {
    baseline: {
      scannedAt: "2026-08-08T00:00:00.000Z",
      sourceFolderUrl,
      expectedMediaCount: 81,
      expectedVideoCount: 77,
      expectedImageCount: 4,
      folderCounts: { root: 13, Automatest: 8, "8Dominos": 9, "8Dominos_Reels": 19, "Nahark Eswed Reels": 14, "ADIB EGYPT REELS": 6, "Enty Asl El Hekaya": 4, "The Shock": 5, "Instagram Reels": 3 }
    },
    profile: {
      name: "Ahmed Azzam",
      fullName: "Ahmed Mohamed Ali Azzam",
      handle: "AhmedZoOoM",
      email: "zomation@gmail.com",
      phone: "+20 102 060 1600",
      education: "Foreign Languages & Translation, English major, Misr University for Science and Technology; GPA 2.7 (B+), Fall 2012/2013.",
      training: "Video Editing, 2K Post Production, 2008.",
      experience: ["Video Editor, Concave Post House (2013–2016)", "Freelance graphics designer since 2006", "Credits represented in the CV include Karam El King, The Shock, commercial editing, a Ramadan 2017 war documentary, The Fisherman, and Melancholia (2018)."],
      skills: ["Final Cut Pro (expert)", "Adobe Premiere Pro (expert)", "Adobe After Effects (moderate)", "Adobe Photoshop (expert)", "Autodesk Maya, Mudbox, MotionBuilder, and Softimage (moderate)", "Adobe Illustrator and InDesign (novice)", "Voice acting/manipulation, script writing/audio recording, stop motion, and analog-media digitization"]
    },
    socials: [
      { name: "YouTube", url: "https://www.youtube.com/@AhmedZoOoM" },
      { name: "Instagram", url: "https://www.instagram.com/ahmedzooom/" },
      { name: "Vimeo", url: "https://vimeo.com/ahmedzooom" },
      { name: "Behance", url: "https://www.behance.net/AhmedZoOoM" },
      { name: "X", url: "https://x.com/AhmedZoOoM" }
    ],
    featuredMediaIds: ["17AowvP6cMvmD0yhEehTEPM7CKsGh7s2_", "1-aKQ0XYCg0QQs-HRzcwntWSWdNTRilVQ", "1XahedVA2AfhI9dL71OwIQHLwB541uw2P", "1QuwhZeMIujn7IA9mUAKesgK9XYGYl6Me", "1UeE0bPFDZCmEHz21MBE9fClbU7UpSm9q", "14QDMVIdDJO6jVTzt5PbcrFviXL2-J-r3"],
    projects
  };
})();
