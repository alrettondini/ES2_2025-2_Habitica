import {
  describe, expect, test,
} from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import EmptyView from '@/components/emptyView.vue';

const localVue = createLocalVue();

describe('EmptyView Component', () => {
  test('renders router-view', () => {
    const wrapper = shallowMount(EmptyView, {
      localVue,
      stubs: ['router-view'],
    });
    expect(wrapper.find('router-view-stub').exists()).to.be.true;
  });

  test('is a simple container for child routes', () => {
    const wrapper = shallowMount(EmptyView, {
      localVue,
      stubs: ['router-view'],
    });
    expect(wrapper.findAll('router-view-stub').length).to.equal(1);
  });
});
