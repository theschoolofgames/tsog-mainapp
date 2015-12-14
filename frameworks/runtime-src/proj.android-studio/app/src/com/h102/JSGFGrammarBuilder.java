package com.h102;

import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by nick on 12/14/15.
 */
public class JSGFGrammarBuilder {

    private static final String GRAMMAR_NAME = "tsog";

    private Set<String> keywords = new HashSet<>();
    private File externalDir;

    public JSGFGrammarBuilder(File externalDir) {
        this.externalDir = externalDir;
    }

    public JSGFGrammarBuilder add(String key) {
        if (key != null && !key.isEmpty()) {
            keywords.add(key.toLowerCase());
        }
        return this;
    }

    public JSGFGrammarBuilder remove(String key) {
        if (key != null) {
            keywords.remove(key.toLowerCase());
        }
        return this;
    }

    public void reset() {
        keywords.clear();
    }

    public String getGrammar() {
        StringBuilder grammar = new StringBuilder( "#JSGF V1.0;\n\ngrammar " + GRAMMAR_NAME + ";\n\npublic <items> = ");

        for(String key : keywords) {
            if (key != null && !key.isEmpty()) {
                if (key.trim().contains(" "))
                    grammar.append("(").append(key.trim().toLowerCase()).append( ") | ");
                else
                    grammar.append(key.trim().toLowerCase()).append(" | ");
            }
        }
        return grammar.delete(grammar.length() - 2, grammar.length()).append(" ;").toString();
    }

    public void saveGrammar() throws IOException {
        FileUtils.writeStringToFile(new File(externalDir, GRAMMAR_NAME + ".gram"), getGrammar());
    }
}
