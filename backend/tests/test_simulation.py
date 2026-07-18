from app.simulation import answer_question, simulate_analysis, simulate_antibiotic_lab, simulate_time_machine


def test_simulation_returns_ranked_antibiotics():
    analysis = simulate_analysis('demo-seed')
    assert analysis['label']
    assert len(analysis['selected_antibiotics']) == 5
    assert analysis['selected_antibiotics'][0]['simulated_efficacy'] >= analysis['selected_antibiotics'][-1]['simulated_efficacy']


def test_time_machine_is_monotonic():
    forecast = simulate_time_machine(0.4)
    assert forecast[0]['resistance_risk'] <= forecast[1]['resistance_risk'] <= forecast[2]['resistance_risk']


def test_assistant_mentions_grounded_evidence():
    assert 'Grounded answer' in answer_question('Can we use meropenem?')


def test_virtual_lab_filters_selection():
    results = simulate_antibiotic_lab(0.5, ['Amikacin'])
    assert results
    assert all(item['name'] == 'Amikacin' for item in results)
