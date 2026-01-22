<script lang="ts">

  import { supabase, newDbKey, signOutDbKey } from "$lib/db/db_ccg_client";

  async function injectSampleData() {
    const choice_option_pool = ["♂", "♀", "♃", "♅"];
    const avatar_pool = ["avatar1.png", "avatar2.png", "avatar3.png", "avatar4.png"];
    let db_uid: string | null = await newDbKey(`sample_`, "tester");
    let avatar_index = 0;
    let gameRoundHistory = [];

    for (let i = 0; i < 300; i++) {
      if (i % 30 === 0) {
        const { error } = await supabase
          .from('game_rounds')
          .insert(gameRoundHistory);

        if (error) {
          console.error("Error inserting sample data:", error);
          return;
        } else {
          console.log(`Inserted rounds for db_uid: ${db_uid}`);
        }
        gameRoundHistory = [];
        const signed_out = await signOutDbKey();
        if (!signed_out) {
          console.error("Failed to sign out previous db_uid");
        }
        db_uid = await newDbKey(`sample_${i/30}`, "tester");
        avatar_index++;
        if (!db_uid) {
          console.error("Failed to create new db_uid");
          return;
        }
      }

      const choice_option_1 = choice_option_pool[Math.floor(Math.random() * choice_option_pool.length)];
      let choice_option_2 = choice_option_pool[Math.floor(Math.random() * choice_option_pool.length)];
      while (choice_option_2 === choice_option_1) {
        choice_option_2 = choice_option_pool[Math.floor(Math.random() * choice_option_pool.length)];
      }

      const row = {
        round_number: i + 1,
        created_at_time: new Date().toISOString(),
        player_1_uid: db_uid,
        player_1_avatar: avatar_pool[avatar_index % avatar_pool.length],
        player_2_avatar: avatar_pool[Math.floor(Math.random() * avatar_pool.length)],
        choice_option_1: choice_option_1,
        choice_option_2: choice_option_2,
        outcome_c1c1: [2, 1],
        outcome_c2c2: [1, 2],
        outcome_c1c2: [0, 0],
        outcome_c2c1: [0, 0],
        player_1_chose: choice_option_1,
      };
      gameRoundHistory.push(row);
    }

    const { error } = await supabase
      .from('game_rounds')
      .insert(gameRoundHistory);
    if (error) {
      console.error("Error inserting final batch of sample data:", error);
    } else {
      console.log(`Inserted final rounds for db_uid: ${db_uid}`);
    }
  }

</script>

<button onclick={() => injectSampleData()}>
  Inject Sample Data
</button>