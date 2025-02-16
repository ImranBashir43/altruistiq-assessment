import { expect, test, describe, it, vi, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
// import Home from '../src/views/Home.vue';
import Home from '../src/views/Home.vue';
import { createTestingPinia } from '@pinia/testing';
// beforeAll(() => {
//   global.document = {
//     createElement: vi.fn(() => ({
//       getContext: vi.fn(),
//     })),
//   };
// });

// describe('Home.vue', () => {
 
//   it('should loop through years correctly', async () => {
//     vi.useFakeTimers(); // Simulate setInterval behavior


//     // const container = document.createElement('div');
//     // document.body.appendChild(container);


//     const wrapper = mount(Home, {
//       // attachTo: container,
//       global: {
//         plugins: [
//           createTestingPinia({
//             // createSpy: vi.fn,
//             initialState: {
//               dataStore: {
//                 emissionData: {
//                   2020: [{ country: 'Country A', total: 100, countryCode: 'A' }],
//                   2021: [{ country: 'Country B', total: 200, countryCode: 'B' }],
//                   2022: [{ country: 'Country C', total: 300, countryCode: 'C' }],
//                 },
//               },
//             },
//           }),
//         ],
//       },
//     });

//     await wrapper.vm.getData(); // Ensure data is fetched
//     await wrapper.vm.$nextTick(); // Wait for Vue updates

//     expect(wrapper.vm.minYear).toBe(2020);
//     expect(wrapper.vm.maxYear).toBe(2022);
//     expect(wrapper.vm.currentYear).toBe(2020);

//     // Simulate multiple interval ticks
//     vi.advanceTimersByTime(1000);
//     await wrapper.vm.$nextTick();
//     expect(wrapper.vm.currentYear).toBe(2020);

//     vi.advanceTimersByTime(1000);
//     await wrapper.vm.$nextTick();
//     expect(wrapper.vm.currentYear).toBe(2020);

//     // Ensure looping back to the first year
//     vi.advanceTimersByTime(1000);
//     await wrapper.vm.$nextTick();
//     expect(wrapper.vm.currentYear).toBe(2020);

//     vi.useRealTimers(); // Restore real timers after test
//   });
// });
// import { expect, describe, it, vi } from 'vitest';
// import { mount } from '@vue/test-utils';
// import Home from '../src/views/Home.vue';
// import { createTestingPinia } from '@pinia/testing';
// import { useDataStore } from '@/stores/dataStore'; // Import the store

// describe('Home.vue', () => {
//   it('should loop through years correctly', async () => {
//     vi.useFakeTimers(); // Simulate setInterval behavior

//     // Mock the Pinia store
//     const pinia = createTestingPinia({
//       initialState: {
//         dataStore: {
//           emissionData: {
//             '2020': [{ country: 'Country A', total: 100, countryCode: 'A' }],
//             '2021': [{ country: 'Country B', total: 200, countryCode: 'B' }],
//             '2022': [{ country: 'Country C', total: 300, countryCode: 'C' }],
//           },
//         },
//       },
//       stubActions: false, // Ensure actions are not stubbed
//     });

//     // Mock the getAllEmissionData method
//     const dataStore = useDataStore(pinia);
//     dataStore.getAllEmissionData = vi.fn().mockResolvedValue({
//       '2020': [{ country: 'Country A', total: 100, countryCode: 'A' }],
//       '2021': [{ country: 'Country B', total: 200, countryCode: 'B' }],
//       '2022': [{ country: 'Country C', total: 300, countryCode: 'C' }],
//     });

//     // Mount the component with the mocked store
//     const wrapper = mount(Home, {
//       global: {
//         plugins: [pinia], // Provide the mocked Pinia store
//       },
//     });

//     await wrapper.vm.getData(); // Ensure data is fetched
//     await wrapper.vm.$nextTick(); // Wait for Vue updates

//     // Initial assertions
//     expect(wrapper.vm.minYear).toBe(2020); // minYear should be 2020
//     expect(wrapper.vm.maxYear).toBe(2022); // maxYear should be 2022
//     expect(wrapper.vm.currentYear).toBe(2020); // currentYear should start at minYear (2020)

//     // Simulate multiple interval ticks
//     vi.advanceTimersByTime(1000); // Advance by 1 second
//     await wrapper.vm.$nextTick();
//     expect(wrapper.vm.currentYear).toBe(2021); // currentYear should increment to 2021

//     vi.advanceTimersByTime(1000); // Advance by another second
//     await wrapper.vm.$nextTick();
//     expect(wrapper.vm.currentYear).toBe(2022); // currentYear should increment to 2022

//     vi.advanceTimersByTime(1000); // Advance by another second
//     await wrapper.vm.$nextTick();
//     expect(wrapper.vm.currentYear).toBe(2020); // currentYear should loop back to minYear (2020)

//     vi.useRealTimers(); // Restore real timers after test
//   });
// });
import { expect, describe, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Home from '../src/views/Home.vue';
import { createTestingPinia } from '@pinia/testing';
import { useDataStore } from '@/stores/dataStore'; // Import the store

describe('Home.vue', () => {
  it('should loop through years correctly', async () => {
    vi.useFakeTimers(); // Simulate setInterval behavior

    // Create a testing Pinia instance
    const pinia = createTestingPinia({
      initialState: {
        dataStore: {
          emissionData: {
            2020: [{ country: 'Country A', total: 100, countryCode: 'A' }],
            2021: [{ country: 'Country B', total: 200, countryCode: 'B' }],
            2022: [{ country: 'Country C', total: 300, countryCode: 'C' }],
          },
        },
      },
      stubActions: false, // Ensure actions are not stubbed
    });

    // Mock the getAllEmissionData method
    const dataStore = useDataStore(pinia);
    dataStore.getAllEmissionData = vi.fn().mockResolvedValue({
      2020: [{ country: 'Country A', total: 100, countryCode: 'A' }],
      2021: [{ country: 'Country B', total: 200, countryCode: 'B' }],
      2022: [{ country: 'Country C', total: 300, countryCode: 'C' }],
    });

    // Mount the component with the mocked store
    const wrapper = mount(Home, {
      global: {
        plugins: [pinia], // Provide the mocked Pinia store
      },
    });

    // Ensure the store is correctly mapped
    expect(wrapper.vm.dataStore).toBeDefined(); // Verify the store is available

    await wrapper.vm.getData(); // Ensure data is fetched
    await wrapper.vm.$nextTick(); // Wait for Vue updates

    // Initial assertions
    expect(wrapper.vm.minYear).toBe(2020); // minYear should be 2020
    expect(wrapper.vm.maxYear).toBe(2022); // maxYear should be 2022
    expect(wrapper.vm.currentYear).toBe(2020); // currentYear should start at minYear (2020)

    // Simulate multiple interval ticks
    vi.advanceTimersByTime(1000); // Advance by 1 second
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentYear).toBe(2021); // currentYear should increment to 2021

    vi.advanceTimersByTime(1000); // Advance by another second
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentYear).toBe(2022); // currentYear should increment to 2022

    vi.advanceTimersByTime(1000); // Advance by another second
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentYear).toBe(2020); // currentYear should loop back to minYear (2020)

    vi.useRealTimers(); // Restore real timers after test
  });
});

test('expect to pass', () => {
  expect(true).toBe(true);
});
