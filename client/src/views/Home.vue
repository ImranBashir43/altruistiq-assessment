<template>
  <main class="container">
    <HomeHeader
      :current-year="currentYear"
      :total="totalCarbon"
    />

    <!-- Loader -->
    <div
      v-if="!isDataLoaded"
      class="loader"
    >
      <FontAwesomeIcon
        icon="spinner"
        spin
      />
      Loading Chart Data...
    </div>

    <!-- Error Handling -->
    <div
      v-else-if="error"
      class="error"
    >
      Failed to load chart data. Please try again later.
    </div>

    <!-- Chart Data -->
    <TransitionGroup
      v-else-if="isLoaded && currentYearSortedCountries.length"
      name="chart"
      tag="div"
      class="chart"
    >
      <HomeChartRow
        v-for="country in currentYearSortedCountries"
        :key="country.code"
        :country="country"
        :max-value="maxCarbonValuePerYear"
      />
    </TransitionGroup>

    <!-- No Data Available -->
    <div v-else>No data available.</div>
  </main>
</template>

<script lang="ts">
  import { mapStores } from 'pinia';
  import { defineComponent } from 'vue';

  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';
  import { library } from '@fortawesome/fontawesome-svg-core';
  library.add(faSpinner);

  import { getColorsRange } from '@/lib/utils/getColorsRange';
  import { useDataStore } from '@/stores/dataStore';
  import type { CountryEmissionsForYear } from '@/typings/general';
  import HomeHeader from '@/components/home/HomeHeader.vue';
  import HomeChartRow from '@/components/home/HomeChartRow.vue';

  type HomeState = {
    currentYear: number;
    minYear: number;
    maxYear: number;
    emissionData: CountryEmissionsForYear[];
    isDataLoaded: boolean; // Add this flag
    error: string | null;
  };

  export default defineComponent({
    name: 'home',

    components: { HomeHeader, HomeChartRow, FontAwesomeIcon },

    data(): HomeState {
      return {
        currentYear: 0,
        minYear: 0,
        maxYear: 0,
        emissionData: [],
        isDataLoaded: false,
        error: null,
      };
    },

    computed: {
      ...mapStores(useDataStore),

      isLoaded() {
        // this.isDataLoaded = true;
        return Object.keys(this.dataStore.emissionData).length > 0;
      },

      countriesForCurrentYear() {
        if (!this.currentYear || !this.dataStore.emissionData) return [];

        const countriesForCurrentYear = this.dataStore.emissionData[this.currentYear];

        if (!countriesForCurrentYear) return [];

        const colorSet = getColorsRange(countriesForCurrentYear.length);

        return (
          this.dataStore.emissionData[this.currentYear]?.map((country: any, i: number) => ({
            color: colorSet[i],
            name: country.country,
            carbon: country.total,
            code: country.countryCode,
          })) || []
        );
      },

      currentYearSortedCountries() {
        return [...this.countriesForCurrentYear].sort((a, b) => b.carbon - a.carbon);
      },

      maxCarbonValuePerYear() {
        return this.currentYearSortedCountries[0]?.carbon || 0;
      },

      totalCarbon() {
        return Math.floor(this.currentYearSortedCountries.reduce((acc, curr) => acc + curr.carbon, 0));
      },
    },

    async mounted() {
      await this.getData();

      setInterval(() => {
        if (this.currentYear >= this.maxYear) {
          this.currentYear = this.minYear;
        } else if (Object.keys(this.dataStore.emissionData).length) {
          this.currentYear++;
        }
      }, 1000);
    },

    methods: {
      delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },
      async getData() {
        try {
          this.isDataLoaded = false;

          await this.dataStore.getAllEmissionData();
          const years = Object.keys(this.dataStore.emissionData);
          if (years.length) {
            this.minYear = +years[0];
            this.maxYear = +years[years.length - 1];
            this.currentYear = this.minYear;
          }
        } catch (err) {
          console.error(err);
          this.error = 'Failed to load data';
        } finally {
          this.isDataLoaded = true;
        }
      },
    },
  });
</script>

<style lang="scss" scoped>
  @use '@/styles/colors' as colors;

  .chart-move {
    transition: all 500ms;
  }

  .container {
    display: flex;
    flex-flow: column;
    align-items: center;
    padding: 89px 0 81px;
  }

  .chart {
    display: flex;
    flex-flow: column;
    gap: 10px;
    max-width: 837px;
    width: 100%;
    padding: 50px;
    background-color: colors.$white;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    margin-top: 20px;
  }

  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 1.2rem;
    color: #333;
    padding: 20px;
    background-color: #f0f0f0;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    margin-top: 20px;
    width: 100%;
    max-width: 837px;
  }

  .error {
    text-align: center;
    font-size: 1.2rem;
    color: #ff4d4f;
    padding: 20px;
  }
</style>
