package lk.careerpath.careerpath_backend.service;

import lk.careerpath.careerpath_backend.enums.QualificationLevel;
import java.util.*;

/** Profile consistency only; provider admission requirements are evaluated separately. */
public final class QualificationRules {
    private QualificationRules() {}
    public static String conflict(QualificationLevel primary, List<QualificationLevel> qualifications) {
        Set<QualificationLevel> selected = new HashSet<>();
        if (primary != null) selected.add(primary);
        if (qualifications != null) selected.addAll(qualifications);
        if (selected.contains(QualificationLevel.OL_FAIL) && selected.contains(QualificationLevel.OL_PASS))
            return "Choose one latest O/L result: incomplete or passed.";
        if (selected.contains(QualificationLevel.AL_FAIL) && selected.contains(QualificationLevel.AL_PASS))
            return "Choose one latest A/L result: incomplete or passed.";
        if (selected.contains(QualificationLevel.OL_FAIL) && selected.contains(QualificationLevel.AL_PASS))
            return "O/L incomplete cannot be combined with A/L passed. Review your latest school results.";
        if (selected.contains(QualificationLevel.UNDERGRADUATE) && selected.contains(QualificationLevel.GRADUATE))
            return "Choose one degree status: currently undergraduate or degree completed.";
        return null;
    }
}
